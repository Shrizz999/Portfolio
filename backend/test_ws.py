import asyncio
import websockets

async def test_ws():
    uri = "ws://127.0.0.1:8000/ws/opencv"
    try:
        async with websockets.connect(uri) as websocket:
            print("Successfully connected!")
            await websocket.close()
    except Exception as e:
        print(f"Failed: {e}")

asyncio.run(test_ws())
