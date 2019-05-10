function valueToRGB(value) {
    let RGB = {R:0,G:0,B:0};

    let group = (1 - value) / 0.5;
    let X = Math.floor(group);
    let Y = Math.floor(255 * (group - X));
    switch (X) {
        case 0: RGB.R = 255; RGB.G = Y; RGB.B = 0; break;
        case 1: RGB.R = 255 - Y; RGB.G = 255; RGB.B = 0; break;
        case 2: RGB.R = 0; RGB.G = 255; RGB.B = Y; break;
    }

    return RGB
}

function valueToHex(value) {
    let RGB = valueToRGB(value);
    return `#${Math.round(RGB.R).toString(16)}${Math.round(RGB.G).toString(16)}${Math.round(RGB.B).toString(16)}`
}

function valueToRgbStr(value) {
    let RGB = valueToRGB(value);
    return `rgb(${RGB.R},${RGB.G},${RGB.B})`
}

let map = new AMap.Map('container');

function drawPolyline(context, path, color, retina) {
    function coor2Pos(lnglat) {
        let pos = map.lngLatToContainer(lnglat);
        if (retina) {
            pos = pos.multiplyBy(2);
        }
        return pos
    }
    let pos = [];
    path.forEach(function(point) {
        pos.push(coor2Pos(point));
    })

    context.lineWidth = 4;
    // console.log(color);
    context.strokeStyle = color;
    context.moveTo(pos[0].x, pos[0].y);
    context.beginPath();
    for (let i = 0; i < pos.length; i++) {
        context.lineTo(pos[i].x, pos[i].y);
    }
    context.stroke();
    // context.closePath();
}

class HeatRoad {
    constructor(paths, values) {
        this.maxValue = Math.max(...values);
        this.paths = paths;
        this.values = values;
    }

    render() {
        let layer;
        let maxValue = this.maxValue;
        let paths = this.paths;
        let values = this.values;

        AMap.plugin('AMap.CustomLayer', function() {
	        var canvas = document.createElement('canvas');
	        layer = new AMap.CustomLayer(canvas, {
                zooms: [3, 20],
                alwaysRender: false,
				zIndex: 120
			});
			var onRender = function(){
			    var retina = AMap.Browser.retina;
                var size = map.getSize();//resize
                var width = size.width;
                var height = size.height;
                canvas.style.width = width+'px'
                canvas.style.height = height+'px'
                if(retina){
                    width*=2;
                    height*=2;
                }
                canvas.width = width;
                canvas.height = height;
			    let ctx = canvas.getContext("2d");

                for (let i = 0; i < paths.length; i++) {
                    drawPolyline(ctx, paths[i], valueToRgbStr(values[i] / maxValue), retina);
                }
			}
			layer.render = onRender;
			layer.setMap(map);
        });
        
        this.layer = layer;
    }

    remove() {
        this.layer.setMap(null);
    }
}