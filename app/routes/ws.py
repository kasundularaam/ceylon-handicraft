from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
import json
from datetime import datetime, timedelta

from ..database import get_db
from ..models import Bid, Product, ProductType, User
from ..config import AUCTION_DURATION

router = APIRouter()

# Store connected clients by product ID
connected_clients = {}


@router.websocket("/ws/auction/{product_id}")
async def auction_websocket(websocket: WebSocket, product_id: str, db: Session = Depends(get_db)):
    await websocket.accept()

    # Check if product exists and is an auction
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.type == ProductType.AUCTION
    ).first()

    if not product:
        await websocket.send_text(json.dumps({"error": "Product not found or not an auction"}))
        await websocket.close()
        return

    # Check if auction has ended
    auction_end_time = product.created_at + timedelta(seconds=AUCTION_DURATION)
    auction_ended = datetime.now() > auction_end_time

    if auction_ended:
        await websocket.send_text(json.dumps({"error": "Auction has ended", "auction_ended": True}))
        await websocket.close()
        return

    # Add client to connected clients for this product
    if product_id not in connected_clients:
        connected_clients[product_id] = []
    connected_clients[product_id].append(websocket)

    try:
        # Send initial bid information
        highest_bid = db.query(Bid).filter(
            Bid.product_id == product_id
        ).order_by(desc(Bid.bid_price)).first()

        # Get the number of bids
        bid_count = db.query(Bid).filter(Bid.product_id == product_id).count()

        bid_info = {
            "product_id": product_id,
            "highest_bid": highest_bid.bid_price if highest_bid else None,
            "highest_bidder_id": highest_bid.user_id if highest_bid else None,
            "base_price": product.base_price,
            "bid_count": bid_count,
            "auction_end_time": auction_end_time.isoformat(),
            "auction_ended": auction_ended
        }

        await websocket.send_text(json.dumps(bid_info))

        # Process incoming bids
        while True:
            data = await websocket.receive_text()
            try:
                bid_data = json.loads(data)

                # Ensure required fields are present
                if "user_id" not in bid_data or "bid_price" not in bid_data:
                    await websocket.send_text(json.dumps({
                        "error": "Missing required fields: user_id and bid_price"
                    }))
                    continue

                # Check if the auction is still active
                current_time = datetime.now()
                if current_time > auction_end_time:
                    await websocket.send_text(json.dumps({
                        "error": "Auction has ended",
                        "auction_ended": True
                    }))
                    continue

                # Verify user exists
                user = db.query(User).filter(
                    User.id == bid_data["user_id"]).first()
                if not user:
                    await websocket.send_text(json.dumps({
                        "error": "Invalid user ID"
                    }))
                    continue

                # Check if bid price is greater than highest bid
                highest_bid = db.query(Bid).filter(
                    Bid.product_id == product_id
                ).order_by(desc(Bid.bid_price)).first()

                min_bid = highest_bid.bid_price if highest_bid else product.base_price

                if bid_data["bid_price"] <= min_bid:
                    await websocket.send_text(json.dumps({
                        "error": f"Bid must be higher than current highest bid: {min_bid}"
                    }))
                    continue

                # Create new bid
                new_bid = Bid(
                    product_id=product_id,
                    user_id=bid_data["user_id"],
                    bid_price=bid_data["bid_price"]
                )

                db.add(new_bid)
                db.commit()

                # Get updated bid count
                bid_count = db.query(Bid).filter(
                    Bid.product_id == product_id).count()

                # Notify all connected clients about the new bid
                if product_id in connected_clients:
                    bid_info = {
                        "product_id": product_id,
                        "highest_bid": new_bid.bid_price,
                        "highest_bidder_id": new_bid.user_id,
                        "base_price": product.base_price,
                        "bid_count": bid_count,
                        "auction_end_time": auction_end_time.isoformat(),
                        "auction_ended": current_time > auction_end_time
                    }

                    for client in connected_clients[product_id]:
                        await client.send_text(json.dumps(bid_info))

            except json.JSONDecodeError:
                await websocket.send_text(json.dumps({"error": "Invalid JSON format"}))
            except Exception as e:
                await websocket.send_text(json.dumps({"error": str(e)}))

    except WebSocketDisconnect:
        # Remove client from connected clients
        if product_id in connected_clients:
            connected_clients[product_id].remove(websocket)
            if not connected_clients[product_id]:
                del connected_clients[product_id]

# Helper function to send notification to all clients when auction ends


async def notify_auction_ended(product_id: str, db: Session):
    if product_id not in connected_clients:
        return

    # Get the highest bid
    highest_bid = db.query(Bid).filter(
        Bid.product_id == product_id
    ).order_by(desc(Bid.bid_price)).first()

    notification = {
        "product_id": product_id,
        "auction_ended": True,
        "highest_bid": highest_bid.bid_price if highest_bid else None,
        "highest_bidder_id": highest_bid.user_id if highest_bid else None
    }

    # Notify all connected clients
    for client in connected_clients[product_id]:
        try:
            await client.send_text(json.dumps(notification))
        except:
            pass  # Client might be disconnected
