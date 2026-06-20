import re

# ── 1. PRISMA
with open('backend/prisma/schema.prisma', 'r', encoding='utf-8') as f:
    content = f.read()

if 'shippingAddress      Json`n  destination' in content:
    content = content.replace('shippingAddress      Json`n  destination          String?', 'shippingAddress      Json\n  destination          String?')
    print('PRISMA: corrige')
elif 'destination          String?' not in content:
    content = content.replace('shippingAddress      Json', 'shippingAddress      Json\n  destination          String?')
    print('PRISMA: ajoute')
else:
    print('PRISMA: OK')

with open('backend/prisma/schema.prisma', 'w', encoding='utf-8') as f:
    f.write(content)

# ── 2. ORDERS SERVICE
with open('backend/src/modules/orders/orders.service.js', 'r', encoding='utf-8') as f:
    content = f.read()

if 'destination: payload.destination' not in content:
    content = content.replace(
        'shippingAddress: payload.shippingAddress,',
        'shippingAddress: payload.shippingAddress,\n        destination: payload.destination || null,'
    )
    print('SERVICE: ajoute destination dans createOrder')
else:
    content = content.replace(
        'shippingAddress: payload.shippingAddress,`n        destination: payload.destination || null,',
        'shippingAddress: payload.shippingAddress,\n        destination: payload.destination || null,'
    )
    print('SERVICE createOrder: OK')

if 'where.destination = query.destination' not in content:
    content = content.replace(
        'if (query.paymentMethod) where.paymentMethod = query.paymentMethod;',
        'if (query.paymentMethod) where.paymentMethod = query.paymentMethod;\n  if (query.destination) where.destination = query.destination;'
    )
    print('SERVICE: ajoute filtre destination')
else:
    content = content.replace(
        'if (query.paymentMethod) where.paymentMethod = query.paymentMethod;`n  if (query.destination) where.destination = query.destination;',
        'if (query.paymentMethod) where.paymentMethod = query.paymentMethod;\n  if (query.destination) where.destination = query.destination;'
    )
    print('SERVICE where: OK')

with open('backend/src/modules/orders/orders.service.js', 'w', encoding='utf-8') as f:
    f.write(content)

# ── 3. ADMIN ORDERS
with open('frontend/src/pages/admin/AdminOrders.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# queryParams
if '...(filters.destination' not in content:
    content = content.replace(
        '...(filters.storeId       && { storeId: filters.storeId }),',
        '...(filters.storeId       && { storeId: filters.storeId }),\n    ...(filters.destination && { destination: filters.destination }),'
    )
    print('ADMIN: ajoute queryParams destination')
else:
    print('ADMIN queryParams: OK')

# select JSX - remplace le bloc corrompu ou ajoute apres DateRangeFilter
SELECT = """
        <select
          value={filters.destination}
          onChange={(e) => updateFilter('destination', e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Toutes destinations</option>
          <option value="SENEGAL">\U0001f1f8\U0001f1f3 Senegal</option>
          <option value="CONGO_EXPRESS">\U0001f1e8\U0001f1ec Congo Express</option>
          <option value="CONGO_GROUPAGE">\U0001f1e8\U0001f1ec Congo Groupage</option>
        </select>"""

bad = re.search(r'/>`\\n\s+<select[\s\S]*?</select>', content)
if bad:
    content = content[:bad.start()] + '/>' + SELECT + content[bad.end():]
    print('ADMIN select: corrige bloc corrompu')
elif 'value={filters.destination}' not in content:
    content = content.replace(
        "onToChange={(v) => updateFilter('to', v)}\n        />",
        "onToChange={(v) => updateFilter('to', v)}\n        />" + SELECT
    )
    print('ADMIN select: ajoute')
else:
    print('ADMIN select: OK')

with open('frontend/src/pages/admin/AdminOrders.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('=== DONE ===')
