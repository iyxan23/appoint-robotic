import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:lottie/lottie.dart';
import 'package:nfc_host_card_emulation/nfc_host_card_emulation.dart';

class CheckInPage extends StatefulWidget {
  const CheckInPage({Key? key}) : super(key: key);

  @override
  State<CheckInPage> createState() => _CheckInPageState();
}

class _CheckInPageState extends State<CheckInPage> {
  NfcState? nfcState = null;

  @override
  void initState() {
    super.initState();

    NfcHce.checkDeviceNfcState().then((value) {
      setState(() {
        nfcState = value;
      });
    }).then((value) async {
      await NfcHce.init(
        // as defined in apduservice.xml: A0 00 15 5A 70 01 D5
        //aid: Uint8List.fromList([0xA0, 0x00, 0x15, 0x5A, 0x70, 0x01, 0xD5]),
        aid: Uint8List.fromList([0xA0, 0xDA, 0xDA, 0xDA, 0xDA]),

        // next parameter determines whether APDU responses from the ports
        // on which the connection occurred will be deleted.
        // If `true`, responses will be deleted, otherwise won't.
        permanentApduResponses: true,

        // next parameter determines whether APDU commands received on ports
        // to which there are no responses will be added to the stream.
        // If `true`, command won't be added, otherwise will.
        listenOnlyConfiguredPorts: false,
      );
    }).then((value) {
      // probably provide the uuid's bytes
      NfcHce.addApduResponse(0, [0x00, 0x12, 0x34, 0x56, 0x78, 0x90]);

      NfcHce.stream.listen((command) {
	// some action here
});
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Check-In'),
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(32.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: nfcState != null
                ? nfcState == NfcState.notSupported
                    ? <Widget>[
                        const Text(
                          "NFC Host Card Emulation is not supported on your device.",
                        )
                      ]
                    : nfcState == NfcState.disabled
                        ? <Widget>[
                            const Text(
                              "NFC is disabled, please enable NFC on your device.",
                            )
                          ]
                        : <Widget>[
                            Lottie.asset("assets/lottie/nfc.json"),
                            const SizedBox(
                              height: 32,
                            ),
                            const Text(
                              'Check-In',
                              style: TextStyle(
                                fontSize: 24,
                                fontWeight: FontWeight.bold,
                              ),
                              textAlign: TextAlign.center,
                            ),
                            const Text(
                              'Hover your phone over the scanner',
                              style: const TextStyle(fontSize: 18),
                              textAlign: TextAlign.center,
                            ),
                          ]
                : <Widget>[
                    const CircularProgressIndicator(),
                  ],
          ),
        ),
      ),
    );
  }
}
