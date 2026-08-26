/* ===== HEWA SAFARIS — SHARED CAMP CART ===== */
(function(){
  var STORAGE_KEY = 'hewaCart';
  var WHATSAPP_NUMBER = '254700556161';

  function readCart(){
    try{
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    }catch(e){ return []; }
  }
  function writeCart(items){
    try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); }catch(e){}
  }
  function money(n){
    return '$' + Number(n).toLocaleString('en-US');
  }

  function buildUI(){
    var overlay = document.createElement('div');
    overlay.className = 'cart-overlay';
    overlay.id = 'hewaCartOverlay';

    var drawer = document.createElement('div');
    drawer.className = 'cart-drawer';
    drawer.id = 'hewaCartDrawer';
    drawer.innerHTML =
      '<div class="cart-head">' +
        '<h3>Your Camp List</h3>' +
        '<button class="cart-close" id="hewaCartClose" aria-label="Close cart">&times;</button>' +
      '</div>' +
      '<span class="cart-sub">Selections from across Hewa Safaris</span>' +
      '<div class="cart-items" id="hewaCartItems"></div>' +
      '<div class="cart-foot">' +
        '<div class="cart-total-row"><span>Estimated total / night</span><b id="hewaCartTotal">$0</b></div>' +
        '<p class="cart-note">Estimates only, per person sharing. Nothing here is booked — a trip designer confirms final rates and availability once you send your list.</p>' +
        '<div class="cart-actions">' +
          '<a class="cart-btn cart-btn-primary" id="hewaCartWhatsapp" href="#" target="_blank" rel="noopener">Send List on WhatsApp</a>' +
          '<a class="cart-btn cart-btn-secondary" id="hewaCartEmail" href="#">Email This List</a>' +
          '<button class="cart-btn cart-btn-clear" id="hewaCartClear" type="button">Clear list</button>' +
        '</div>' +
      '</div>';

    var floatBtn = document.createElement('button');
    floatBtn.className = 'cart-float';
    floatBtn.id = 'hewaCartFloat';
    floatBtn.type = 'button';
    floatBtn.setAttribute('aria-label', 'Open your camp list');
    floatBtn.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="#D1A550" stroke-width="1.6"><circle cx="9" cy="21" r="1.4" fill="#D1A550" stroke="none"/><circle cx="18" cy="21" r="1.4" fill="#D1A550" stroke="none"/><path d="M2.5 3h2l2.4 12.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L21 7H6"/></svg>' +
      '<span class="cart-badge hidden" id="hewaCartBadge">0</span>';

    document.body.appendChild(overlay);
    document.body.appendChild(drawer);
    document.body.appendChild(floatBtn);

    floatBtn.addEventListener('click', openDrawer);
    overlay.addEventListener('click', closeDrawer);
    document.getElementById('hewaCartClose').addEventListener('click', closeDrawer);
    document.getElementById('hewaCartClear').addEventListener('click', function(){
      if(confirm('Clear every camp from your list?')){
        writeCart([]);
        render();
      }
    });
  }

  function openDrawer(){
    document.getElementById('hewaCartDrawer').classList.add('open');
    document.getElementById('hewaCartOverlay').classList.add('open');
  }
  function closeDrawer(){
    document.getElementById('hewaCartDrawer').classList.remove('open');
    document.getElementById('hewaCartOverlay').classList.remove('open');
  }

  function render(){
    var items = readCart();
    var badge = document.getElementById('hewaCartBadge');
    var list = document.getElementById('hewaCartItems');
    var totalEl = document.getElementById('hewaCartTotal');
    var waLink = document.getElementById('hewaCartWhatsapp');
    var emailLink = document.getElementById('hewaCartEmail');

    if(items.length === 0){
      badge.classList.add('hidden');
      badge.textContent = '0';
      list.innerHTML = '<div class="cart-empty">Your list is empty. Browse camps &amp; stays on any journey or the Destinations page and tap "Add to Camp List".</div>';
    } else {
      badge.classList.remove('hidden');
      badge.textContent = items.length;
      list.innerHTML = items.map(function(item, i){
        return '<div class="cart-item">' +
          '<div class="cart-item-info">' +
            '<div class="cart-item-tier">' + item.tier + '</div>' +
            '<div class="cart-item-name">' + item.name + '</div>' +
            '<div class="cart-item-dest">' + item.destination + '</div>' +
            '<div class="cart-item-price">' + money(item.price) + ' / night, per person</div>' +
          '</div>' +
          '<button class="cart-item-remove" data-idx="' + i + '" type="button">Remove</button>' +
        '</div>';
      }).join('');
      list.querySelectorAll('.cart-item-remove').forEach(function(btn){
        btn.addEventListener('click', function(){
          var idx = parseInt(btn.getAttribute('data-idx'), 10);
          var current = readCart();
          current.splice(idx, 1);
          writeCart(current);
          render();
        });
      });
    }

    var total = items.reduce(function(sum, it){ return sum + Number(it.price || 0); }, 0);
    totalEl.textContent = money(total);

    var lines = items.map(function(it){ return '- ' + it.name + ' (' + it.tier + ', ' + it.destination + ') ~' + money(it.price) + '/night pp'; });
    var msg = items.length
      ? 'Hi Hewa Safaris, I\'d like to enquire about a trip using this camp list:\n' + lines.join('\n') + '\n\nEstimated total: ' + money(total) + ' per night, per person.'
      : 'Hi Hewa Safaris, I\'d like to know more about your safari packages.';
    waLink.href = 'https://wa.me/' + WHATSAPP-NUMBER + '254700556161?text=' + encodeURIComponent(msg);

    var subject = 'My Hewa Safaris camp list';
    var body = items.length
      ? lines.join('\n') + '\n\nEstimated total: ' + money(total) + ' per night, per person.'
      : 'I have not added any camps yet.';
    emailLink.href = 'mailto:hewasafaris@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  }

  function showToast(msg){
    var toast = document.getElementById('hewaCartToast');
    if(!toast){
      toast = document.createElement('div');
      toast.className = 'cart-toast';
      toast.id = 'hewaCartToast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(function(){ toast.classList.remove('show'); }, 2600);
  }

  function add(item){
    var items = readCart();
    items.push({
      name: item.name,
      tier: item.tier,
      destination: item.destination,
      price: Number(item.price) || 0
    });
    writeCart(items);
    render();
    showToast(item.name + ' added to your camp list');
  }

   function wireAddButtons(){
    var selectors = '.tier-add-btn[data-name], .loc-chip-add[data-name], .pref-add-btn[data-name]';
    var buttons = document.querySelectorAll(selectors);
    
    buttons.forEach(function(btn){
      btn.addEventListener('click', function(){
        add({
          name: btn.getAttribute('data-name'),
          tier: btn.getAttribute('data-tier'),
          destination: btn.getAttribute('data-destination'),
          price: btn.getAttribute('data-price')
        });
        
        var original = btn.textContent;
        btn.textContent = 'Added ✓';
        btn.classList.add('added');
        setTimeout(function(){ btn.textContent = original; btn.classList.remove('added'); }, 1600);
      });
    });
  }

  function init(){
    buildUI();
    render();
    wireAddButtons();
  }

  window.HewaCart = { add: add };

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
