# Business Moderation API (Protected)

Base path: /business/mod/
Auth: Token-based (Authorization: Token <token>)
Access: users.models:IsAdminOrModerator (roles: admin, moderator)
Host (prod): http://176.126.164.86:8000

Note: All endpoints accept multipart/form-data when sending files. JSON responses.

---

## Auth header example
```http
Authorization: Token <your_token_here>
```

---

## Categories

GET `http://176.126.164.86:8000/business/categories/`

Ответ 200 OK (массив):
```json
[
  {
    "id": 1,
    "name_kg": "Тамак",
    "name_ru": "Еда",
    "created_at": "2025-11-19T06:40:10.123456",
    "icon_url": "http://176.126.164.86:8000/media/business/category_icons/food.png",
    "gradient_start": "#000000",
    "gradient_end": "#FFFFFF"
  }
]
```

Доступны два URL (оба валят полный объект):
- GET `http://176.126.164.86:8000/business/cards/<pk>/`
- GET `http://176.126.164.86:8000/business/pk/<pk>/`

Пример:
- `/business/cards/123456/`
- `/business/pk/123456/`

Ответ 200 OK:
```json
{
  "pk": "123456",
  "id": "123456",
  "name": "Coffee House",
  "short_description": "Лучший кофе",
  "long_description": "Подробное описание...",
  "profile_photo": "http://176.126.164.86:8000/media/business/profile_photos/coffee.jpg",
  "header_photo": "http://176.126.164.86:8000/media/business/header_photos/header.jpg",
  "theme_color": "#000000",

  "cta_phone": "+996 555 123 456",
  "additional_phone": null,
  "management_phone": null,
  "price_info": "договорная",

  "address_text": "ул. Пушкина, д. 10",
  "latitude": 42.8746,
  "longitude": 74.5698,
  "tags": ["кофе", "завтрак"],

  "city": "Бишкек",
  "city_id": 1,
  "category": "Еда",
  "category_id": 3,

  "created_at": "2025-11-19T06:40:10.123456",
  "updated_at": "2025-11-19T06:55:01.987654",

  "photos": [
    "http://176.126.164.86:8000/media/business/carousel_photos/1.jpg",
    "http://176.126.164.86:8000/media/business/carousel_photos/2.jpg"
  ],

  "catalog_items": [
    {
      "id": 17,
      "name": "Капучино",
      "description": "250 мл",
      "photo": "http://176.126.164.86:8000/media/business/catalog_photos/cappuccino.jpg",
      "price": "150",
      "created_at": "2025-11-19T06:41:22.000000"
    }
  ],

  "schedules": [
    { "day_of_week": 0, "open_time": "09:00:00", "close_time": "20:00:00", "is_closed": false },
    { "day_of_week": 6, "open_time": null,       "close_time": null,       "is_closed": true }
  ]
}



### Create category
POST /business/mod/categories/create/
- form fields:
  - name_kg (required)
  - name_ru (required)
  - gradient_start (optional, HEX)
  - gradient_end (optional, HEX)
- files:
  - icon (optional, PNG)

Response 201:
```json
{ "id": 12 }
```

### Update category
PUT or PATCH /business/mod/categories/<id>/edit/
- any of: name_kg, name_ru, gradient_start, gradient_end
- files: icon (optional)

Response 200:
```json
{ "message": "updated" }
```

### Delete category
DELETE /business/mod/categories/<id>/delete/

Response 200:
```json
{ "message": "deleted" }
```

---

## Business cards

### Create card
POST /business/mod/cards/create/
- required: city_id (int), name
- optional data: category_id, short_description, long_description, cta_phone, additional_phone, management_phone, price_info, address_text, latitude, longitude, theme_color
- optional data (JSON string): tags (e.g. "[\"кофе\", \"завтрак\"]")
- files: profile_photo?, header_photo?

Response 201:
```json
{ "pk": "123456" }
```

### Update card
PUT or PATCH /business/mod/cards/<pk>/edit/
- any fields from Create
- tags as JSON string if provided
- files: profile_photo?, header_photo?

Response 200:
```json
{ "message": "updated" }
```

### Delete card
DELETE /business/mod/cards/<pk>/delete/

Response 200:
```json
{ "message": "deleted" }
```

---

## Schedules

### Replace all schedules for a card
POST /business/mod/cards/<pk>/schedules/set/
- body param: schedules
  - Can be a JSON array or a JSON string in form-data
  - Item shape:
    ```json
    {
      "day_of_week": 0,
      "open_time": "09:00:00",
      "close_time": "20:00:00",
      "is_closed": false
    }
    ```
  - day_of_week: 0=Mon ... 6=Sun
- Behavior: deletes existing schedules and creates new ones

Response 200:
```json
{ "message": "schedules set", "count": 7 }
```

---

## Carousel photos

### Add photos to card
POST /business/mod/cards/<pk>/photos/add/
- files: images[]=file1&images[]=file2 (or single image)

Response 201:
```json
{ "created_ids": [3, 4, 5] }
```

### Delete photo
DELETE /business/mod/photos/<photo_id>/delete/

Response 200:
```json
{ "message": "deleted" }
```

---

## Catalog items

### Add catalog item
POST /business/mod/cards/<pk>/catalog/add/
- required: name
- optional: description, price
- files: photo?

Response 201:
```json
{ "id": 42 }
```

### Update catalog item
PUT or PATCH /business/mod/catalog/<item_id>/edit/
- any of: name, description, price
- files: photo?

Response 200:
```json
{ "message": "updated" }
```

### Delete catalog item
DELETE /business/mod/catalog/<item_id>/delete/

Response 200:
```json
{ "message": "deleted" }
```

---

## Curl examples (prod)

Create category:
```bash
curl -X POST \
  -H "Authorization: Token $TOKEN" \
  -F name_kg=Тамак -F name_ru=Еда \
  -F gradient_start=#000000 -F gradient_end=#FFFFFF \
  -F icon=@icon.png \
  http://176.126.164.86:8000/business/mod/categories/create/
```

Create card:
```bash
curl -X POST \
  -H "Authorization: Token $TOKEN" \
  -F city_id=1 -F category_id=3 -F name="Coffee House" \
  -F short_description="Лучший кофе" \
  -F tags='["кофе","завтрак"]' \
  -F profile_photo=@avatar.jpg \
  http://176.126.164.86:8000/business/mod/cards/create/
```

Set schedules (replace all):
```bash
curl -X POST \
  -H "Authorization: Token $TOKEN" \
  -F schedules='[{"day_of_week":0,"open_time":"09:00:00","close_time":"20:00:00","is_closed":false}]' \
  http://176.126.164.86:8000/business/mod/cards/123456/schedules/set/
```

Add carousel photos:
```bash
curl -X POST \
  -H "Authorization: Token $TOKEN" \
  -F images[]=@1.jpg -F images[]=@2.jpg \
  http://176.126.164.86:8000/business/mod/cards/123456/photos/add/
```

Add catalog item:
```bash
curl -X POST \
  -H "Authorization: Token $TOKEN" \
  -F name="Капучино" -F price=150 -F photo=@cappuccino.jpg \
  http://176.126.164.86:8000/business/mod/cards/123456/catalog/add/
```
