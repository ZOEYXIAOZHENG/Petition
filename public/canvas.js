const myCanvas = $("canvas");
myCanvas.css({ border: "2px dotted grey" });
const cont = myCanvas[0].getContext("2d");

cont.strokeStyle = "black";
var x;
var y;
var move;
var sign = $("#input-canvas");

myCanvas.on("mousedown", function (e) {
    e.stopPropagation();
    x = e.offsetX;
    y = e.offsetY;
    myCanvas.on(
        "mousemove",
        (move = function (e) {
            cont.moveTo(x, y);
            x = e.offsetX;
            y = e.offsetY;
            cont.lineTo(x, y);
            cont.stroke();
        })
    );
});

myCanvas.on("mouseup", function () {
    myCanvas.off("mousemove");
    sign.val(myCanvas[0].toDataURL());
    console.log(sign[0]);
});
