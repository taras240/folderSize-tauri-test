import { invoke } from "@tauri-apps/api/core";

export function getRASystemID({ fileType, path }) {
    const map = {
        // Nintendo
        nes: 7,
        fds: 7,

        smc: 3,
        sfc: 3,

        z64: 2,
        v64: 2,
        n64: 2,

        gb: 4,
        gbc: 6,
        gba: 5,

        nds: 18,
        dsi: 78,

        gcm: 16,
        gcz: 16,

        "3ds": 62,
        cxi: 62,
        cci: 62,
        cxi: 62,

        // Sega
        sms: 11,
        gg: 15,

        md: 1,
        gen: 1,
        smd: 1,

        "32x": 10,

        // chd: 77, // Jaguar CD (для інших CD-платформ теж використовується, тому можеш прибрати)

        // Sony
        pbp: 41, //psp
        cso: 41,
        // iso: 41,

        bin: 12,//ps1

        // Atari
        a26: 25,
        a52: 50,
        a78: 51,
        lnx: 13,
        j64: 17,
        jag: 17,

        // NEC
        pce: 8,
        sgx: 8,

        // SNK
        ngp: 14,
        ngc: 14,

        // WonderSwan
        ws: 53,
        wsc: 53,

        // Virtual Boy
        vb: 28,

        // MSX
        mx1: 29,
        mx2: 29,

        // Commodore
        d64: 30,
        t64: 30,
        crt: 30,
        prg: 30,

        // ZX
        z81: 31,
        p81: 31,

        tap: 59,
        tzx: 59,
        z80: 59,
        sna: 59,
        szx: 59,

        // Oric
        dsk: 32,
        ort: 32,

        // Amiga
        adf: 35,
        ipf: 35,

        // Atari ST
        st: 36,
        msa: 36,

        // Amstrad CPC
        cdt: 37,

        // Apple II
        do: 38,
        po: 38,
        nib: 38,

        // Neo Geo CD
        neo: 56,

        // Fairchild
        chf: 57,

        // FM Towns
        fdi: 58,

        // Pokemon Mini
        min: 24,

        // N-Gage
        ngage: 61,

        // Watara
        wsv: 63,

        // Sharp X1
        x1: 64,

        // TIC-80
        tic: 65,

        // Thomson
        fd: 66,

        // Sega Pico
        pico: 68,

        // Mega Duck
        duck: 69,

        // Arduboy
        hex: 71,

        // WASM-4
        wasm: 72,

        // Uzebox
        uze: 80,
    };

    return map[fileType?.toLowerCase()] ?? "";
}