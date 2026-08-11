def hitung_sus(jawaban):
    total = 0

    for i in range(10):
        if (i + 1) % 2 == 1:
            # Pertanyaan ganjil
            total += jawaban[i] - 1
        else:
            # Pertanyaan genap
            total += 5 - jawaban[i]

    return total * 2.5


# Contoh
jawaban = [4, 2, 5, 1, 4, 2, 5, 1, 4, 2]

skor = hitung_sus(jawaban)

print("Skor SUS:", skor)