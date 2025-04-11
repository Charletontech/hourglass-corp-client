// Grabbing elements
const up = document.querySelectorAll(".up");
const left = document.querySelectorAll(".left");
const left2 = document.querySelectorAll(".left2");

// setting up observer
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("slide-up");
    } else {
      entry.target.classList.remove("slide-up");
    }
  });
});

up.forEach((element) => {
  observer.observe(element);
});

const observer2 = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("slide-left");
    } else {
      entry.target.classList.remove("slide-left");
    }
  });
});

left.forEach((element) => {
  observer2.observe(element);
});

const observer3 = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("slide-left2");
    } else {
      entry.target.classList.remove("slide-left2");
    }
  });
});

left2.forEach((element) => {
  observer3.observe(element);
});

// LOGIC FOR SIGN UP PAGE
document.addEventListener("DOMContentLoaded", function () {
  // refresh server
  fetch("https://hourglass-corp-server.onrender.com/refresh-server");

  // multi-step form logic
  const nextBtns = document.querySelectorAll(".next-btn");
  const prevBtns = document.querySelectorAll(".prev-btn");
  const formSteps = document.querySelectorAll(".form-step");
  const badges = document.querySelectorAll(".badge");
  let formStepIndex = 0;
  // Function to update form steps visibility
  function updateFormSteps() {
    formSteps.forEach((formStep, index) => {
      if (index === formStepIndex) {
        formStep.classList.add("active");
      } else {
        formStep.classList.remove("active");
      }
    }); // Update the badges for the current step
    badges.forEach((badge, index) => {
      if (index <= formStepIndex) {
        badge.classList.add("active");
      } else {
        badge.classList.remove("active");
      }
    });
  } // Click Next button to go to the next form step
  nextBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (formStepIndex < formSteps.length - 1) {
        formStepIndex++;
        updateFormSteps();
      }
    });
  }); // Click Previous button to go back to the previous form step
  prevBtns?.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (formStepIndex > 0) {
        formStepIndex--;
        updateFormSteps();
      }
    });
  }); // Initially show the first form step
  updateFormSteps();
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

  fetch("http://localhost:5000/signup", fetchOptions)
    .then((res) => {
      res.json().then((data) => {
        if (res.ok) {
          Swal.fire({
            position: "center",
            icon: "success",
            iconColor: "#e47734",
            title: "Success",
            text: "You have been successfully registered. Welcome aboard!",
            showConfirmButton: false,
            html: `
                    <p><b style="color: #e47734">Customer</b>:  <br> ${data.message.customer}</p>
                    <br>
                    <p><b style="color: #e47734">Account name</b>:  <br> ${data.message.accountName}</p>
                    <br>
                    <p><b style="color: #e47734">Account number</b>:  <br> ${data.message.accountNo}</p>
                    <br>
                    <p><b style="color: #e47734">Status</b>:  <br> ${data.message.regStatus}</p>
                    `,
          });
        } else if (res.status === 501) {
          Swal.fire({
            position: "center",
            icon: "info",
            iconColor: "#e47734",
            title: "We had an issue!",
            text: `${data.message}`,
            showConfirmButton: true,
          });
        } else {
          Swal.fire({
            position: "center",
            icon: "error",
            iconColor: "#e47734",
            title: "Oops!",
            text: `${data.message}`,
            showConfirmButton: true,
            timer: 15000,
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
