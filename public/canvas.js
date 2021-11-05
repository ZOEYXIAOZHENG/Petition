const canvas = $("#canvas");
canvas.style.border = "2px dotted grey";
const cont = canvas.getContext("2d");

cont.strokeStyle = "black";
var x;
var y;
var move;
var sign = document.$("signature");

canvas.on("mousedown", function (e) {
    e.stopPropagation();
    x = e.offsetX;
    y = e.offsetY;
    canvas.on(
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

canvas.on("mouseup", function () {
    canvas.off("mousemove");
    sign.value = canvas.toDataURL();
    console.log("sign.val: ", sign.value);
});
