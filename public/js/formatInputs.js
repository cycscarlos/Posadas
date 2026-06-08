(function() {
  'use strict';

  function formatThousands(str) {
    return str.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  function formatTelByCountry(str, code) {
    str = str.replace(/[^0-9]/g, '');
    if (code === '+1') {
      var r = '';
      for (var i = 0; i < str.length; i++) {
        if (i === 3 || i === 6) r += '.';
        r += str[i];
      }
      return r;
    }
    var r = '';
    for (var i = 0; i < str.length; i++) {
      if (i === 4 || i === 7 || i === 9) r += '.';
      r += str[i];
    }
    return r;
  }

  function parseStoredTel(val) {
    var code = '';
    var num = val;
    if (val.indexOf('+58') === 0) { code = '+58'; num = val.slice(3); }
    else if (val.indexOf('+1') === 0) { code = '+1'; num = val.slice(2); }
    return { code: code, num: num };
  }

  var cedulaInput = document.getElementById('cedula');
  var cedulaPrefix = document.getElementById('cedula_prefix');
  var telefonoInput = document.getElementById('telefono');
  var telefonoPrefix = document.getElementById('telefono_prefix');

  if (cedulaInput && cedulaPrefix) {
    var storedCedula = cedulaInput.getAttribute('data-stored') || '';
    if (storedCedula) {
      var m = storedCedula.match(/^([VEve]-)?(\d+)$/);
      if (m) {
        if (m[1]) cedulaPrefix.value = m[1];
        cedulaInput.value = formatThousands(m[2]);
      }
    }

    cedulaInput.addEventListener('input', function() {
      var raw = this.value.replace(/[^0-9]/g, '');
      this.value = formatThousands(raw);
    });
  }

  if (telefonoInput && telefonoPrefix) {
    var storedTel = telefonoInput.getAttribute('data-stored') || '';
    if (storedTel) {
      var p = parseStoredTel(storedTel);
      if (p.code) {
        for (var i = 0; i < telefonoPrefix.options.length; i++) {
          if (telefonoPrefix.options[i].value === p.code) {
            telefonoPrefix.selectedIndex = i;
            break;
          }
        }
      }
      telefonoInput.value = formatTelByCountry(p.num, p.code || telefonoPrefix.value);
    }

    telefonoInput.addEventListener('input', function() {
      var code = telefonoPrefix ? telefonoPrefix.value : '+58';
      this.value = formatTelByCountry(this.value, code);
    });

    telefonoPrefix.addEventListener('change', function() {
      if (telefonoInput.value) {
        telefonoInput.value = formatTelByCountry(telefonoInput.value, this.value);
      }
    });
  }

  document.querySelectorAll('form').forEach(function(form) {
    form.addEventListener('submit', function() {
      if (cedulaInput && cedulaPrefix) {
        var rawCed = cedulaInput.value.replace(/[^0-9]/g, '');
        cedulaInput.value = cedulaPrefix.value + rawCed;
      }
      if (telefonoInput && telefonoPrefix) {
        var rawTel = telefonoInput.value.replace(/[^0-9]/g, '');
        telefonoInput.value = telefonoPrefix.value + rawTel;
      }
    });
  });
})();
