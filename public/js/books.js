window.onload = () => {
  const btn_add = document.querySelectorAll("#btn_Add");
  var cart = JSON.parse(sessionStorage.getItem("cart")) || [];
  const modal = document.getElementById("modal");
  const cart_list = document.getElementById("cartlist");
  const itemList = document.getElementById("itemList");
  const btn_empty = document.getElementById("btn_empty");
  const btn_send = document.getElementById("btn_send") || " ";
  const btn_cart = document.getElementById("cart");
  btn_add.forEach((btn) => {
    // add btn_Add for each item that they research . everytime they click on btn_add add that item in sessionstorage.
    btn.addEventListener("click", () => {
      const bookSelected = btn.getAttribute("booktitle");
      let i = cart.findIndex((data) => {
        return data.bookName === bookSelected;
      });
      if (i == -1) {
        var item = {
          bookName: bookSelected,
          quality: 1,
        };
        cart.push(item);
      } else {
        cart[i].quality += 1;
      }
      sessionStorage.setItem("cart", JSON.stringify(cart));
    });
  });

  // if user click cart icon , display modal cart_list
  btn_cart.addEventListener("click", () => {
    cart_list.style.display = "flex";
    modal.style.display = "block";
    btn_cart.style.display = "none";
    let list_cartitem = "";
    var cart_update = JSON.parse(sessionStorage.getItem("cart")) || [];
    if (cart_update.length >= 1) {
      cart_update.forEach((element) => {
        list_cartitem +=
          '<div class="cart_item"><div class="book_title">' +
          element.bookName +
          '</div><div class="book_quality">Qty: ' +
          element.quality +
          "</div></div>";
      });
      itemList.innerHTML = list_cartitem;
      btn_empty.style.display = "block";
      btn_send.style.display = "block";
    } else {
      btn_empty.style.display = "none";
      btn_send.style.display = "none";
    }
  });

  btn_send.addEventListener("click", () => {
    generate_order_id(
      JSON.parse(sessionStorage.getItem("cart")),
      send_order_to_database
    );
  });

  btn_empty.addEventListener("click", () => {
    sessionStorage.removeItem("cart");
    location.reload();
  });
  // set up callback function to create unquie order ID based on UTC time, then send order.
  function generate_order_id(data, callback) {
    const currentTime = new Date();
    const year = currentTime.getFullYear();
    const month = String(currentTime.getMonth() + 1).padStart(2, "0"); // Adding leading zero if needed
    const day = String(currentTime.getDate()).padStart(2, "0");
    const hours = String(currentTime.getHours()).padStart(2, "0");
    const minutes = String(currentTime.getMinutes()).padStart(2, "0");
    const seconds = String(currentTime.getSeconds()).padStart(2, "0");
    const orderId = `${year}${month}${day}${hours}${minutes}${seconds}`;
    data.unshift({ orderId });
    callback(data);
  }
  function send_order_to_database(order) {
    const url = "/Books/TransactionProcess";
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ order }),
    })
      .then((res) => {
        if (res.status == 200) {
          sessionStorage.removeItem("cart");
          window.location.replace("/List");
        }
      })
      .catch((err) => {
        console.log("Error:", err);
      });
  }
  // If user click on window , close cart
  window.onclick = (e) => {
    if (e.target == modal) {
      document.getElementById("cartlist").style.display = "none";
      document.getElementById("modal").style.display = "none";
      document.getElementById("cart").style.display = "block";
    }
  };
};
