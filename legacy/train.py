from ultralytics import YOLO

if __name__ == '__main__':
    # 1. Load the pre-trained base model
    model = YOLO("yolov8n.pt")

    # 2. Fine-tune the model on your custom car damage dataset
    # Note: Changed device to "mps" (Metal Performance Shaders) so it uses your Mac's 
    # hardware GPU acceleration instead of the slow CPU!
    model.train(
        data="dataset.yaml", 
        epochs=50, 
        imgsz=640, 
        device="mps"
    )