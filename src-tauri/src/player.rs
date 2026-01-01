use rodio::{Decoder, OutputStream, Sink};
use std::cell::RefCell;
use std::{fs::File, io::BufReader};

thread_local! {
    static PLAYER: RefCell<Option<(OutputStream, Sink)>> = RefCell::new(None);
}

pub fn play_file(path: String) -> Result<(), String> {
    let (stream, stream_handle) = OutputStream::try_default().map_err(|e| e.to_string())?;

    let file = File::open(path).map_err(|e| e.to_string())?;
    let source = Decoder::new(BufReader::new(file)).map_err(|e| e.to_string())?;

    let sink = Sink::try_new(&stream_handle).map_err(|e| e.to_string())?;
    sink.append(source);
    sink.play();

    // зберігаємо в thread_local
    PLAYER.with(|player| {
        *player.borrow_mut() = Some((stream, sink));
    });

    Ok(())
}

pub fn stop() {
    PLAYER.with(|player| {
        if let Some((_stream, sink)) = player.borrow_mut().take() {
            sink.stop();
        }
    });
}
