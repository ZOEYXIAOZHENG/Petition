function showPassword() {
    var x = document.getElementById("pp");
    if (x.type === "password") {
        x.type = "text";
    } else {
        x.type = "password";
    }
}
