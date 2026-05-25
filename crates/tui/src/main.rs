mod wizard;

use std::io;

use std::time::Duration;

use crossterm::{
  event::{self, Event, KeyCode, KeyEventKind},
  execute,
  terminal::{disable_raw_mode, enable_raw_mode, EnterAlternateScreen, LeaveAlternateScreen},
};
use ratatui::{
  backend::CrosstermBackend,
  Terminal,
};

use wizard::Wizard;

fn main() -> io::Result<()> {
  enable_raw_mode()?;
  let mut stdout = io::stdout();
  execute!(stdout, EnterAlternateScreen)?;
  let backend = CrosstermBackend::new(stdout);
  let mut terminal = Terminal::new(backend)?;

  let mut wizard = Wizard::new();
  let res = run_app(&mut terminal, &mut wizard);

  disable_raw_mode()?;
  execute!(terminal.backend_mut(), LeaveAlternateScreen)?;
  terminal.show_cursor()?;

  if let Err(err) = res {
    eprintln!("Error: {err}");
  }

  Ok(())
}

fn run_app<B: ratatui::backend::Backend>(
  terminal: &mut Terminal<B>,
  wizard: &mut Wizard,
) -> io::Result<()> {
  loop {
    terminal.draw(|frame| wizard.render(frame))?;

    wizard.tick();

    if wizard.is_done() {
      if event::poll(Duration::from_secs(3600))? {
        if let Event::Key(key) = event::read()? {
          if key.kind == KeyEventKind::Press {
            return Ok(());
          }
        }
      }
      continue;
    }

    if wizard.is_rendering() {
      if event::poll(Duration::from_millis(100))? {
        if let Event::Key(key) = event::read()? {
          if key.kind == KeyEventKind::Press && key.code == KeyCode::Esc {
            // let render finish in background
          }
        }
      }
      continue;
    }

    if let Event::Key(key) = event::read()? {
      if key.kind == KeyEventKind::Press {
        match key.code {
          KeyCode::Esc => {
            if wizard.is_at_start() {
              return Ok(());
            }
            wizard.go_back();
          }
          KeyCode::Enter => {
            wizard.advance();
          }
          KeyCode::Up | KeyCode::Char('k') => wizard.decrement(),
          KeyCode::Down | KeyCode::Char('j') => wizard.increment(),
          KeyCode::Left | KeyCode::Char('h') => wizard.go_back(),
          KeyCode::Right | KeyCode::Char('l') => wizard.advance(),
          KeyCode::Tab => wizard.advance(),
          KeyCode::Backspace => wizard.pop_char(),
          KeyCode::Char(ch) => wizard.push_char(ch),
          _ => {}
        }
      }
    }
  }
}
