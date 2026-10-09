"""Gera as texturas de asfalto (tiles sem emenda) usadas no topo e no corte do pavimento.

    python3 tools/textures.py   (rodar de dentro de srr/)

asphalt-old.webp: asfalto gasto, cinza, agregado exposto.
asphalt-new.webp: capa nova, preta, com brilho fino de agregado.
"""
import numpy as np
from PIL import Image

N = 512
rng = np.random.default_rng(14)


def periodic_noise(scale):
    """Ruído suave e periódico (filtrado no domínio da frequência, logo sem emenda)."""
    white = rng.standard_normal((N, N))
    f = np.fft.fftfreq(N)
    fx, fy = np.meshgrid(f, f)
    r = np.sqrt(fx ** 2 + fy ** 2)
    filt = np.exp(-(r * scale) ** 2)
    out = np.real(np.fft.ifft2(np.fft.fft2(white) * filt))
    return (out - out.mean()) / (out.std() + 1e-9)


def stones(count, rmin, rmax):
    """Agregado: pedrinhas irregulares com tom próprio (0..1), dando a volta no tile.
    Devolve (tom, cobertura)."""
    tone = np.zeros((N, N))
    cover = np.zeros((N, N))
    w = int(np.ceil(rmax * 1.6)) + 1
    oy, ox = np.mgrid[-w:w + 1, -w:w + 1]
    for _ in range(count):
        cx, cy = rng.uniform(0, N, 2)
        r = rng.uniform(rmin, rmax)
        a = rng.uniform(0, np.pi)
        e = rng.uniform(0.5, 1.0)
        ix, iy = int(cx), int(cy)
        dx, dy = ox + ix - cx, oy + iy - cy
        u = dx * np.cos(a) + dy * np.sin(a)
        v = (-dx * np.sin(a) + dy * np.cos(a)) / e
        d = np.sqrt(u ** 2 + v ** 2) / r
        m = np.clip((1.15 - d) * 3, 0, 1)
        # leve sombreamento: pedra mais clara em cima à esquerda
        shade = 1 + 0.25 * np.clip(-(dx + dy) / (r * 1.4), -1, 1)
        t = rng.uniform(0, 1)
        rows = (oy + iy) % N
        cols = (ox + ix) % N
        sub_c = cover[rows, cols]
        upd = m > sub_c
        tone[rows[upd], cols[upd]] = (t * shade)[upd]
        cover[rows[upd], cols[upd]] = m[upd]
    return tone, cover


def save(arr, tint, path):
    rgb = np.clip(arr[..., None] * np.array(tint)[None, None, :], 0, 255).astype(np.uint8)
    Image.fromarray(rgb).save(path, quality=72, method=6)


# --- asfalto velho: matriz cinza gasta, agregado claro exposto ---
matrix = 86 + 7 * periodic_noise(40) + 6 * periodic_noise(5) + 9 * rng.standard_normal((N, N))
tone, cover = stones(4200, 0.9, 3.8)
stone_px = 104 + tone * 52 + 6 * rng.standard_normal((N, N))
old = matrix * (1 - cover) + stone_px * cover
save(old / 255, (246, 243, 236), "assets/img/asphalt-old.webp")

# --- capa nova: preta, fechada, agregado fino quase invisível e brilhos ---
matrix = 22 + 2.5 * periodic_noise(30) + 3 * rng.standard_normal((N, N))
tone, cover = stones(4200, 0.9, 2.8)
stone_px = 26 + tone * 22
new = matrix * (1 - cover * 0.8) + stone_px * cover * 0.8
glint = (rng.random((N, N)) > 0.997) * rng.uniform(30, 80, (N, N))
new += glint
save(new / 255, (250, 250, 255), "assets/img/asphalt-new.webp")
print("ok")
