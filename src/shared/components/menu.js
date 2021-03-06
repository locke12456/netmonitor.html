const { Menu, MenuItem } = require("devtools-sham-modules");
const { isFirefoxPanel } = require("devtools-config");

function createPopup(doc) {
  let popup = doc.createElement("menupopup");

  if (popup.openPopupAtScreen) {
    return popup;
  }

  function preventDefault(e) {
    e.preventDefault();
    e.returnValue = false;
  }

  let mask = doc.querySelector("#contextmenu-mask");
  if (!mask) {
    mask = doc.createElement("div");
    mask.id = "contextmenu-mask";
    mask.oncontextmenu = preventDefault;
    if (doc.body) {
      doc.body.appendChild(mask);
    }
  }

  mask.onclick = () => popup.hidePopup();

  popup.openPopupAtScreen = function(clientX, clientY) {
    this.style.setProperty("left", `${clientX}px`);
    this.style.setProperty("top", `${clientY}px`);
    mask = doc.querySelector("#contextmenu-mask");
    window.onwheel = preventDefault;
    if (mask) {
      mask.classList.add("show");
    }
    this.dispatchEvent(new Event("popupshown"));
    this.popupshown;
  };

  popup.hidePopup = function() {
    this.remove();
    mask = doc.querySelector("#contextmenu-mask");
    if (mask) {
      mask.classList.remove("show");
    }
    window.onwheel = null;
  };

  return popup;
}

if (!isFirefoxPanel()) {
  Menu.prototype.createPopup = createPopup;
}

function onShown(menu, popup) {
  popup.childNodes.forEach((menuitem, index) => {
    const item = menu.items[index];

    if (!item.disabled) {
      menuitem.onclick = () => {
        item.click();
        popup.hidePopup();
      };
    }
  });
}

function showMenu(e, items) {
  if (items.length === 0) {
    return;
  }

  const menu = new Menu();
  items.forEach(item => menu.append(new MenuItem(item)));

  if (isFirefoxPanel()) {
    return menu.popup(e.screenX, e.screenY, { doc: window.parent.document });
  }

  menu.on("open", (_, popup) => onShown(menu, popup));
  menu.popup(e.clientX, e.clientY, { doc: document });
}

module.exports = {
  showMenu,
};
