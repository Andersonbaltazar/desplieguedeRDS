async function listAll() {
  const res = await fetch('/api/contacts');
  const data = await res.json();
  renderList(data);
}

function renderList(items) {
  const el = document.getElementById('list');
  el.innerHTML = '';
  items.forEach(c => {
    const d = document.createElement('div');
    d.className = 'contact';
    const img = document.createElement('img');
    img.className = 'photo';
    img.src = c.foto || 'https://via.placeholder.com/80x80?text=No+Foto';
    const info = document.createElement('div');
    info.innerHTML = `<strong>${c.nombre} ${c.apellidos}</strong><br>${c.correo || ''}<br>${c.fecha_nac || ''}`;
    const actions = document.createElement('div');
    const btnEdit = document.createElement('button');
    btnEdit.textContent = 'Editar';
    btnEdit.onclick = () => fillForm(c);
    const btnDel = document.createElement('button');
    btnDel.textContent = 'Eliminar';
    btnDel.onclick = async () => {
      if (!confirm('Eliminar contacto?')) return;
      await fetch(`/api/contacts/${c.id}`, { method: 'DELETE' });
      listAll();
    };
    actions.appendChild(btnEdit);
    actions.appendChild(btnDel);

    d.appendChild(img);
    d.appendChild(info);
    d.appendChild(actions);
    el.appendChild(d);
  });
}

function fillForm(c) {
  const form = document.getElementById('form');
  form.id.value = c.id;
  form.nombre.value = c.nombre;
  form.apellidos.value = c.apellidos;
  form.correo.value = c.correo || '';
  form.fecha_nac.value = c.fecha_nac || '';
}

document.getElementById('form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const id = form.id.value;
  const formData = new FormData(form);
  if (id) {
    const res = await fetch(`/api/contacts/${id}`, { method: 'PUT', body: formData });
    await res.json();
  } else {
    const res = await fetch('/api/contacts', { method: 'POST', body: formData });
    await res.json();
  }
  form.reset();
  listAll();
});

document.getElementById('reset').addEventListener('click', () => document.getElementById('form').reset());
document.getElementById('btnList').addEventListener('click', () => listAll());
document.getElementById('btnSearch').addEventListener('click', async () => {
  const q = document.getElementById('search').value.trim();
  if (!q) return listAll();
  const res = await fetch(`/api/contacts/search?apellido=${encodeURIComponent(q)}`);
  const data = await res.json();
  renderList(data);
});

// Inicializa
listAll();
