class ImageReader {
    constructor(imgSrc) {
        let canvas = document.createElement("canvas")
        let context = canvas.getContext("2d")
        let image = new Image()
        image.src = imgSrc
        this.image = image
        this.context = context
    }

    read(data) {
        let image = this.image
        let context = this.context
        this.image.onload = ()=>{
            context.drawImage(image,0,0,image.width,image.height)
            data(this.context.getImageData(0,0,image.width,image.height))
        }
    }
}

export default ImageReader