import json
import os
import time
import binascii
import requests
from hashlib import sha256

from pn532pi import Pn532, Pn532I2c
from pn532pi.nfc.pn532 import PN532_MIFARE_ISO14443A_106KBPS

ENDPOINT = os.environ.get("BACKEND_NOTIFY_ENDPOINT")
SECRET = os.environ.get("BACKEND_NOTIFY_SECRET")

if ENDPOINT is None or SECRET is None:
    print("❌Environment Variable BACKEND_NOTIFY_ENDPOINT dan BACKEND_NOTIFY_SECRET harus diisi")
    exit(1)

AID = [0xA0, 0xDA, 0xDA, 0xDA, 0xDA]

# 0x00 | 0xA4 | 0x04 | 0x00 | 0xXX | Application AID | 0x00
SELECT_APDU = [
    0x00, # CLA: Kelas 0
    0xa4, # INS: Instruksi 0xA4 (SELECT)
    0x04, # P1 : Port 1
    0x00, # P2 : Port 2

    len(AID),   # Panjang AID
    *AID,       # AID
    0x00        # Le
]

def main():
    i2c = Pn532I2c(1)
    nfc = Pn532(i2c)

    nfc.begin()

    firm = nfc.getFirmwareVersion()
    print("PN5 {:#x} Firmware ver. {:d}.{:d}".format((firm >> 24) & 0xFF, (firm >> 16) & 0xFF, (firm >> 8) & 0xFF))

    if not nfc.SAMConfig():
        print()
        print("❌Gagal melakukan konfigurasi SAM")
        exit(1)

    while True:
        print("Menunggu untuk di-tap...")
        (result, uid) = nfc.readPassiveTargetID(PN532_MIFARE_ISO14443A_106KBPS, 0, True)

        if not result:
            print("Mengulangi")
            continue

        print(f"Ditemukan, UID: {uid.hex()}")
        print(f"Mengirimkan APDU: {binascii.hexlify(bytearray(SELECT_APDU))}")

        (res, resp) = nfc.inDataExchange(SELECT_APDU)

        print(f"Respon: {resp} [{'berhasil' if res else 'gagal'}]")
        if res:
            notify_backend(resp)

        time.sleep(1)

def gen_challange(payload):
    payload_str = json.dumps(payload)
    return sha256((payload_str + SECRET).encode()).hexdigest()

def notify_backend(uuid):
    body = { id: uuid }
    payload = {
        **body,
        "challange": gen_challange(body)
    }

    requests.post(ENDPOINT, json=payload)

if __name__ == "__main__":
    main()
