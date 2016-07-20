/*!
 * trimImage v1.0
 * Trims the surrounding white or transparent pixels from an image
 */
(function ($) {

    $.fn.trimImage = function () {
        return this.each(function () {
            var image = $(this),
                width = image.width(),
                height = image.height(),
                canvas = document.createElement('canvas'),
                context = canvas.getContext('2d'),
                img = new Image,
                src = image.attr('src');

            img.crossOrigin = "Anonymous";
            img.src = src;

            img.onload = function () {
                
                canvas.width = this.width;
                canvas.height = this.height;

                context.drawImage(this, 0, 0, canvas.width, canvas.height);

                var copy = document.createElement('canvas').getContext('2d'),
                pixels = context.getImageData(0, 0, canvas.width, canvas.height),
                bound = {
                    top: null,
                    left: null,
                    right: null,
                    bottom: null
                },
                x, y;

                for (var i = 0; i < pixels.data.length; i += 4) {
                    // if NOT transparent
                    if (pixels.data[i + 3] !== 0) {

                        // if NOT white
                        if (pixels.data[i] !== 255 && pixels.data[i + 1] !== 255 && pixels.data[i + 2] !== 255) {
                            x = (i / 4) % canvas.width;
                            y = ~~((i / 4) / canvas.width);

                            if (bound.top === null) {
                                bound.top = y;
                            }

                            if (bound.left === null) {
                                bound.left = x;
                            } else if (x < bound.left) {
                                bound.left = x;
                            }

                            if (bound.right === null) {
                                bound.right = x;
                            } else if (bound.right < x) {
                                bound.right = x;
                            }

                            if (bound.bottom === null) {
                                bound.bottom = y;
                            } else if (bound.bottom < y) {
                                bound.bottom = y;
                            }
                        }
                    }
                }

                var trimWidth = bound.right + 1 - bound.left,
                    trimHeight = bound.bottom + 1 - bound.top,
                    trimmed = context.getImageData(bound.left, bound.top, trimWidth, trimHeight);

                copy.canvas.width = trimWidth;
                copy.canvas.height = trimHeight;
                copy.putImageData(trimmed, 0, 0);

                $(copy.canvas).insertAfter(image);

                image.remove();
            };

            
        });
    };

}(jQuery));