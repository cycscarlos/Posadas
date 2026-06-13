(function () {
  const state = { open: false };

  function createBubble() {
    const btn = document.createElement("button");
    btn.id = "chatbot-bubble";
    btn.setAttribute("aria-label", "Abrir chat");
    btn.innerHTML =
      '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/></svg>';
    document.body.appendChild(btn);
    return btn;
  }

  function createPanel() {
    const panel = document.createElement("div");
    panel.id = "chatbot-panel";

    panel.innerHTML =
      '<div id="chatbot-header">' +
      '<span>Posada Bot</span>' +
      '<button id="chatbot-close" aria-label="Cerrar chat">&times;</button>' +
      "</div>" +
      '<div id="chatbot-messages">' +
      '<div class="chatbot-msg bot chat-menu-msg">' +
      "¡Hola! Soy el asistente virtual de Posada Casa Manantial. Seleccioná una opción:" +
      '<div class="chat-menu">' +
      '<button type="button" class="chat-menu-btn" data-msg="habitaciones">1. Tipos de habitación</button>' +
      '<button type="button" class="chat-menu-btn" data-msg="precios">2. Precios</button>' +
      '<button type="button" class="chat-menu-btn" data-msg="disponibilidad">3. Disponibilidad</button>' +
      '<button type="button" class="chat-menu-btn" data-msg="promociones">4. Promociones</button>' +
      '<button type="button" class="chat-menu-btn" data-msg="contacto">5. Información de contacto</button>' +
      "</div>" +
      "</div>" +
      "</div>" +
      '<div id="chatbot-typing">Escribiendo...</div>' +
      '<div id="chatbot-input-area">' +
      '<input id="chatbot-input" type="text" placeholder="Escribe un mensaje..." autocomplete="off" />' +
      '<button id="chatbot-send" aria-label="Enviar mensaje">' +
      '<svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>' +
      "</button>" +
      "</div>";

    document.body.appendChild(panel);
    return panel;
  }

  function addMessage(text, sender, menu) {
    const container = document.getElementById("chatbot-messages");
    const div = document.createElement("div");
    div.className = "chatbot-msg " + sender;
    if (menu) div.classList.add("chat-menu-msg");
    
    var p = document.createElement("p");
    p.textContent = text;
    div.appendChild(p);
    
    if (menu) {
      var menuDiv = document.createElement("div");
      menuDiv.className = "chat-menu";
      menu.forEach(function (item) {
        var btn = document.createElement("button");
        btn.className = "chat-menu-btn";
        btn.setAttribute("data-msg", item.msg);
        btn.textContent = item.label;
        menuDiv.appendChild(btn);
      });
      div.appendChild(menuDiv);
    }
    
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  }

  function showMainMenu() {
    const container = document.getElementById("chatbot-messages");
    const div = document.createElement("div");
    div.className = "chatbot-msg bot chat-menu-msg";
    var p = document.createElement("p");
    p.textContent = "Seleccioná una opción:";
    div.appendChild(p);
    var menuDiv = document.createElement("div");
    menuDiv.className = "chat-menu";
    var items = [
      { msg: "habitaciones", label: "1. Tipos de habitación" },
      { msg: "precios", label: "2. Precios" },
      { msg: "disponibilidad", label: "3. Disponibilidad" },
      { msg: "promociones", label: "4. Promociones" },
      { msg: "contacto", label: "5. Información de contacto" },
    ];
    items.forEach(function (item) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chat-menu-btn";
      btn.setAttribute("data-msg", item.msg);
      btn.textContent = item.label;
      menuDiv.appendChild(btn);
    });
    div.appendChild(menuDiv);
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  }

  function addBackMenu(text, sender) {
    const container = document.getElementById("chatbot-messages");
    const div = document.createElement("div");
    div.className = "chatbot-msg " + sender + " chat-menu-msg";
    var p = document.createElement("p");
    p.textContent = text;
    div.appendChild(p);
    var menuDiv = document.createElement("div");
    menuDiv.className = "chat-menu";
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chat-menu-btn";
      btn.setAttribute("data-msg", "menu");
      btn.textContent = "🔙 Menú principal";
      menuDiv.appendChild(btn);
    div.appendChild(menuDiv);
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  }

  function showTyping() {
    const el = document.getElementById("chatbot-typing");
    if (el) el.style.display = "block";
    const container = document.getElementById("chatbot-messages");
    if (container) container.scrollTop = container.scrollHeight;
  }

  function hideTyping() {
    const el = document.getElementById("chatbot-typing");
    if (el) el.style.display = "none";
  }

  function sendMessage(text) {
    addMessage(text, "user");

    const input = document.getElementById("chatbot-input");
    const sendBtn = document.getElementById("chatbot-send");
    if (input) input.disabled = true;
    if (sendBtn) sendBtn.disabled = true;

    showTyping();

    fetch("/chatbot/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    })
      .then(function (r) {
        if (!r.ok) throw new Error("Error " + r.status);
        return r.json();
      })
      .then(function (data) {
        hideTyping();
        addMessage(data.reply, "bot");
        if (data.showMenu !== false && text.toLowerCase() !== "menu") {
          addBackMenu("¿Necesitas algo más?", "bot");
        }
      })
      .catch(function () {
        hideTyping();
        addMessage("Lo siento, ocurrió un error al procesar tu mensaje. Intenta de nuevo.", "bot");
      })
      .finally(function () {
        if (input) {
          input.disabled = false;
          input.value = "";
          input.focus();
        }
        if (sendBtn) sendBtn.disabled = false;
      });
  }

  function togglePanel() {
    const panel = document.getElementById("chatbot-panel");
    const bubble = document.getElementById("chatbot-bubble");
    state.open = !state.open;
    if (panel) panel.classList.toggle("open", state.open);
    if (bubble) bubble.style.display = state.open ? "none" : "flex";
    if (state.open) {
      const input = document.getElementById("chatbot-input");
      if (input) setTimeout(function () { input.focus(); }, 600);
    }
  }

  function init() {
    if (document.getElementById("chatbot-bubble")) return;

    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/css/chatbot.css";
    document.head.appendChild(link);

    var bubble = createBubble();
    var panel = createPanel();

    bubble.addEventListener("click", togglePanel);
    document.getElementById("chatbot-close").addEventListener("click", togglePanel);

    document.getElementById("chatbot-send").addEventListener("click", function () {
      var input = document.getElementById("chatbot-input");
      var text = input && input.value.trim();
      if (text) sendMessage(text);
    });

    document.getElementById("chatbot-input").addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        var input = document.getElementById("chatbot-input");
        var text = input && input.value.trim();
        if (text) sendMessage(text);
      }
    });

    document.getElementById("chatbot-messages").addEventListener("click", function (e) {
      var btn = e.target.closest(".chat-menu-btn");
      if (!btn) return;
      var msg = btn.getAttribute("data-msg");
      if (!msg) return;
      if (msg === "menu") {
        showMainMenu();
      } else {
        sendMessage(msg);
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
