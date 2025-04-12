// LOGIC FOR SIGN UP PAGE
document.addEventListener("DOMContentLoaded", function () {
  // refresh server
  fetch("https://hourglass-corp-server.onrender.com/refresh-server");
});

// HANDLE SUBMIT SIGN UP
var signUpData = {};
var form = document.getElementById("signup-form");
form.addEventListener("submit", (e) => {
  e.preventDefault();

  // alert user to wait...
  Swal.fire({
    position: "center",
    icon: "info",
    // iconColor: "#e47734",
    title: "Processing...",
    text: `Please wait while we create your account. This might take a while depending on your network, don't close this page during this time please.`,
    showConfirmButton: false,
  });

  const formData = new FormData(form);
  for (const [key, value] of formData) {
    signUpData[key] = value;
  }
  const fetchOptions = {
    method: "post",
    body: JSON.stringify(signUpData),
    headers: new Headers({
      "Content-Type": "application/json",
    }),
  };

  fetch("https://hourglass-corp-server.onrender.com/login", fetchOptions)
    .then((res) => {
      res.json().then((data) => {
        console.log(data.message);
        if (res.ok) {
          Swal.fire({
            position: "center",
            icon: "success",
            iconColor: "#e47734",
            title: "Success",
            html: `<p style="text-align: center;"> Sign in successful. <br> Welcome back! ${
              JSON.parse(data.message).name
            }<p>`,
            showConfirmButton: false,
          });

          // save user data in session
          sessionStorage.setItem("hourglassUserData", data.message);
          window.location.href = "/dashboard.htm";
        } else if (res.status === 400) {
          Swal.fire({
            position: "center",
            icon: "error",
            iconColor: "#e47734",
            title: "Oops!",
            text: `${data.message}`,
            showConfirmButton: true,
            timer: 15000,
          });
        } else {
          Swal.fire({
            position: "center",
            icon: "error",
            iconColor: "#e47734",
            title: "We had an issue!",
            text: `${data.message}`,
            showConfirmButton: true,
          });
          console.log("error");
        }
      });
    })
    .catch((err) => {
      alert("An unexpected error occurred");
      console.log(err);
    });
});
