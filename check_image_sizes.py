from PIL import Image

files = {
    'AIRSTRIp-1': 'images/safari-vehicle-airstrip-1.jpg',
    'AIRSTRIp-2': 'images/safari-vehicle-airstrip-2.jpg',
    'JPEG-OPT(3)': 'images/jpeg-optimizer_safari-vehicle airstrip(3).jpeg',
}

CHARS = '@%#*+=-:. '  # dark -> bright

def tire_crop_preview(path, label):
    img = Image.open(path).convert('L')
    w, h = img.size
    # Left tire region (fractions of full image)
    box = (int(w*0.03), int(h*0.42), int(w*0.38), int(h*0.72))
    crop = img.crop(box)
    cols = 76
    cw, ch = crop.size
    rows = max(1, round(cols * ch / cw / 2.1))
    small = crop.resize((cols, rows))
    px = small.load()
    print(f'--- {label} left-tire crop ---')
    for y in range(rows):
        print(''.join(CHARS[min(9, px[x, y] * 10 // 256)] for x in range(cols)))
    print()

for label, p in files.items():
    tire_crop_preview(p, label)