use std::sync::mpsc;

use msemblyln_core::{
  presets::{self, AspectPreset, SizePreset},
  types::RenderRequest,
  video::{self, ProgressEvent, ProgressInfo},
};
use ratatui::{
  layout::{Alignment, Constraint, Direction, Layout, Rect},
  style::{Color, Modifier, Style, Stylize},
  text::{Line, Span},
  widgets::{Block, BorderType, Borders, Gauge, List, ListItem, Paragraph, Wrap},
  Frame,
};

#[derive(Clone, Copy, PartialEq)]
enum Step {
  Welcome,
  ImagePath,
  AudioPath,
  Aspect,
  Resolution,
  OutputPath,
  Review,
  Rendering,
  Done,
}

pub struct Wizard {
  step: Step,
  image_path: String,
  audio_path: String,
  aspect_index: usize,
  size_index: usize,
  output_path: String,
  result: Option<String>,
  command: Option<String>,
  error: Option<String>,
  progress_rx: Option<mpsc::Receiver<ProgressEvent>>,
  current_progress: Option<ProgressInfo>,
}

impl Wizard {
  pub fn new() -> Self {
    Self {
      step: Step::Welcome,
      image_path: String::new(),
      audio_path: String::new(),
      aspect_index: 1,
      size_index: 1,
      output_path: String::new(),
      result: None,
      command: None,
      error: None,
      progress_rx: None,
      current_progress: None,
    }
  }

  pub fn is_at_start(&self) -> bool {
    self.step == Step::Welcome
  }

  pub fn is_done(&self) -> bool {
    self.step == Step::Done
  }

  pub fn is_rendering(&self) -> bool {
    self.step == Step::Rendering
  }

  pub fn tick(&mut self) {
    if self.step != Step::Rendering {
      return;
    }

    if let Some(ref rx) = self.progress_rx {
      while let Ok(event) = rx.try_recv() {
        match event {
          ProgressEvent::Progress(info) => {
            self.current_progress = Some(info);
          }
          ProgressEvent::Done(resp) => {
            self.result = Some(resp.output_path);
            self.command = Some(resp.command);
            self.step = Step::Done;
            self.progress_rx = None;
            return;
          }
          ProgressEvent::Error(err) => {
            self.error = Some(err);
            self.step = Step::Done;
            self.progress_rx = None;
            return;
          }
        }
      }
    }
  }

  fn selected_aspect(&self) -> &AspectPreset {
    &presets::ASPECT_PRESETS[self.aspect_index]
  }

  fn selected_size(&self) -> &SizePreset {
    &presets::SIZE_PRESETS[self.size_index]
  }

  pub fn advance(&mut self) {
    self.step = match self.step {
      Step::Welcome => Step::ImagePath,
      Step::ImagePath => Step::AudioPath,
      Step::AudioPath => Step::Aspect,
      Step::Aspect => Step::Resolution,
      Step::Resolution => Step::OutputPath,
      Step::OutputPath => Step::Review,
      Step::Review => {
        if self.validate() {
          self.render_video();
        }
        return;
      }
      Step::Rendering => Step::Done,
      Step::Done => Step::Done,
    };
  }

  pub fn go_back(&mut self) {
    self.step = match self.step {
      Step::Welcome => Step::Welcome,
      Step::ImagePath => Step::ImagePath,
      Step::AudioPath => Step::ImagePath,
      Step::Aspect => Step::AudioPath,
      Step::Resolution => Step::Aspect,
      Step::OutputPath => Step::Resolution,
      Step::Review => Step::OutputPath,
      Step::Rendering => Step::Review,
      Step::Done => Step::Done,
    };
  }

  pub fn increment(&mut self) {
    match self.step {
      Step::Aspect => {
        self.aspect_index =
          (self.aspect_index + 1).min(presets::ASPECT_PRESETS.len() - 1);
      }
      Step::Resolution => {
        self.size_index =
          (self.size_index + 1).min(presets::SIZE_PRESETS.len() - 1);
      }
      _ => {}
    }
  }

  pub fn decrement(&mut self) {
    match self.step {
      Step::Aspect => {
        self.aspect_index = self.aspect_index.saturating_sub(1);
      }
      Step::Resolution => {
        self.size_index = self.size_index.saturating_sub(1);
      }
      _ => {}
    }
  }

  pub fn push_char(&mut self, ch: char) {
    match self.step {
      Step::ImagePath => {
        self.image_path.push(ch);
      }
      Step::AudioPath => {
        self.audio_path.push(ch);
      }
      Step::OutputPath => {
        self.output_path.push(ch);
      }
      _ => {}
    }
  }

  pub fn pop_char(&mut self) {
    match self.step {
      Step::ImagePath => {
        self.image_path.pop();
      }
      Step::AudioPath => {
        self.audio_path.pop();
      }
      Step::OutputPath => {
        self.output_path.pop();
      }
      _ => {}
    }
  }

  fn validate(&self) -> bool {
    if self.image_path.is_empty() {
      return false;
    }
    if self.audio_path.is_empty() {
      return false;
    }
    true
  }

  fn render_video(&mut self) {
    self.step = Step::Rendering;
    self.error = None;
    self.result = None;
    self.command = None;
    self.current_progress = None;

    let aspect = self.selected_aspect();
    let size = self.selected_size();
    let (width, height) = presets::compute_size(aspect, size);

    let output_path = if self.output_path.is_empty() {
      None
    } else {
      Some(self.output_path.clone())
    };

    let request = RenderRequest {
      image_path: self.image_path.clone(),
      audio_path: self.audio_path.clone(),
      output_path,
      width,
      height,
      fps: 30,
      format: "mp4".into(),
      crf: Some(18),
    };

    let duration = video::probe(&request.audio_path)
      .ok()
      .and_then(|p| p.duration_seconds);

    match video::render_with_progress(request, duration) {
      Ok(rx) => {
        self.progress_rx = Some(rx);
      }
      Err(err) => {
        self.error = Some(err);
        self.step = Step::Done;
      }
    }
  }

  pub fn render(&self, frame: &mut Frame) {
    let area = frame.area();

    match self.step {
      Step::Welcome => self.render_welcome(frame, area),
      Step::ImagePath => self.render_text_input(
        frame,
        area,
        "Step 1: Image path",
        "Enter the path to your cover image (PNG, JPG, etc.)",
        &self.image_path,
      ),
      Step::AudioPath => self.render_text_input(
        frame,
        area,
        "Step 2: Audio path",
        "Enter the path to your audio file (MP3, WAV, AAC)",
        &self.audio_path,
      ),
      Step::Aspect => self.render_select(
        frame,
        area,
        "Step 3: Aspect ratio",
        "Choose the output aspect ratio.",
        presets::ASPECT_PRESETS
          .iter()
          .map(|a| a.label)
          .collect::<Vec<_>>()
          .as_slice(),
        self.aspect_index,
      ),
      Step::Resolution => self.render_select(
        frame,
        area,
        "Step 4: Resolution",
        "Choose the output resolution.",
        presets::SIZE_PRESETS
          .iter()
          .map(|s| s.label)
          .collect::<Vec<_>>()
          .as_slice(),
        self.size_index,
      ),
      Step::OutputPath => self.render_text_input(
        frame,
        area,
        "Step 5: Output path (optional)",
        "Enter output path or leave empty to save next to audio file.",
        &self.output_path,
      ),
      Step::Review => self.render_review(frame, area),
      Step::Rendering => self.render_rendering(frame, area),
      Step::Done => self.render_done(frame, area),
    }
  }

  fn render_welcome(&self, frame: &mut Frame, area: Rect) {
    let block = Block::default()
      .title(" msemblyln ")
      .title_alignment(Alignment::Center)
      .borders(Borders::ALL)
      .border_type(BorderType::Rounded)
      .border_style(Style::default().fg(Color::Cyan));

    let inner = block.inner(area);
    frame.render_widget(block, area);

    let chunks = Layout::default()
      .direction(Direction::Vertical)
      .constraints([
        Constraint::Length(3),
        Constraint::Length(1),
        Constraint::Length(3),
        Constraint::Min(0),
      ])
      .split(inner);

    let title = Paragraph::new("Audio + Image → MP4 Video")
      .style(Style::default().fg(Color::Cyan).add_modifier(Modifier::BOLD))
      .alignment(Alignment::Center);
    frame.render_widget(title, chunks[0]);

    let desc = Paragraph::new(
      "A step-by-step wizard to combine a single image and audio into a ready-to-upload video.\n\n\
       Supported output: MP4 (H.264 + AAC)\n\
       Aspect ratios: 16:9, 9:16, 1:1  |  Resolutions: up to 4K",
    )
    .alignment(Alignment::Center)
    .wrap(Wrap { trim: true });
    frame.render_widget(desc, chunks[2]);

    let hint = Paragraph::new("Press Enter to start  |  Esc to quit")
      .style(Style::default().fg(Color::DarkGray))
      .alignment(Alignment::Center);
    frame.render_widget(hint, chunks[3]);
  }

  fn render_text_input(
    &self,
    frame: &mut Frame,
    area: Rect,
    title: &str,
    description: &str,
    value: &str,
  ) {
    let block = Block::default()
      .title(format!(" {title} "))
      .title_alignment(Alignment::Center)
      .borders(Borders::ALL)
      .border_type(BorderType::Rounded)
      .border_style(Style::default().fg(Color::Cyan));

    let inner = block.inner(area);
    frame.render_widget(block, area);

    let chunks = Layout::default()
      .direction(Direction::Vertical)
      .constraints([
        Constraint::Length(3),
        Constraint::Length(3),
        Constraint::Length(1),
        Constraint::Min(0),
      ])
      .split(inner);

    let desc = Paragraph::new(description)
      .style(Style::default().fg(Color::Gray))
      .wrap(Wrap { trim: true });
    frame.render_widget(desc, chunks[0]);

    let input_style = if value.is_empty() {
      Style::default().fg(Color::DarkGray)
    } else {
      Style::default().fg(Color::White).add_modifier(Modifier::BOLD)
    };
    let display = if value.is_empty() {
      "Type the path here..."
    } else {
      value
    };
    let input = Paragraph::new(display).style(input_style);
    let input_area = Rect {
      x: inner.x + 2,
      y: chunks[1].y,
      width: inner.width.saturating_sub(4),
      height: 3,
    };
    frame.render_widget(input, input_area);

    let help = Paragraph::new("Enter: confirm  |  Esc or ←: back  |  Type to edit")
      .style(Style::default().fg(Color::DarkGray))
      .alignment(Alignment::Center);
    frame.render_widget(help, chunks[3]);
  }

  fn render_select(
    &self,
    frame: &mut Frame,
    area: Rect,
    title: &str,
    description: &str,
    options: &[&str],
    selected: usize,
  ) {
    let block = Block::default()
      .title(format!(" {title} "))
      .title_alignment(Alignment::Center)
      .borders(Borders::ALL)
      .border_type(BorderType::Rounded)
      .border_style(Style::default().fg(Color::Cyan));

    let inner = block.inner(area);
    frame.render_widget(block, area);

    let chunks = Layout::default()
      .direction(Direction::Vertical)
      .constraints([
        Constraint::Length(3),
        Constraint::Length(options.len() as u16 * 3 + 2),
        Constraint::Min(0),
      ])
      .split(inner);

    let desc = Paragraph::new(description)
      .style(Style::default().fg(Color::Gray))
      .wrap(Wrap { trim: true });
    frame.render_widget(desc, chunks[0]);

    let items: Vec<ListItem> = options
      .iter()
      .enumerate()
      .map(|(i, label)| {
        let prefix = if i == selected { "▸ " } else { "  " };
        let content = if i == selected {
          Line::from(Span::styled(
            format!("{prefix}{label}"),
            Style::default()
              .fg(Color::Cyan)
              .add_modifier(Modifier::BOLD),
          ))
        } else {
          Line::from(Span::styled(
            format!("{prefix}{label}"),
            Style::default().fg(Color::White),
          ))
        };
        ListItem::new(content)
      })
      .collect();

    let list = List::new(items).block(
      Block::default()
        .borders(Borders::ALL)
        .border_style(Style::default().fg(Color::DarkGray)),
    );
    frame.render_widget(list, chunks[1]);

    let help = Paragraph::new("↑↓: navigate  |  Enter: confirm  |  Esc or ←: back")
      .style(Style::default().fg(Color::DarkGray))
      .alignment(Alignment::Center);
    frame.render_widget(help, chunks[2]);
  }

  fn render_review(&self, frame: &mut Frame, area: Rect) {
    let block = Block::default()
      .title(" Review & Confirm ")
      .title_alignment(Alignment::Center)
      .borders(Borders::ALL)
      .border_type(BorderType::Rounded)
      .border_style(Style::default().fg(Color::Yellow));

    let inner = block.inner(area);
    frame.render_widget(block, area);

    let aspect = self.selected_aspect();
    let size = self.selected_size();
    let (width, height) = presets::compute_size(aspect, size);

    let lines = vec![
      Line::from(vec![
        Span::raw("Image:  "),
        Span::styled(
          if self.image_path.is_empty() {
            "(not set)"
          } else {
            &self.image_path
          },
          Style::default().fg(Color::Cyan),
        ),
      ]),
      Line::from(vec![
        Span::raw("Audio:  "),
        Span::styled(
          if self.audio_path.is_empty() {
            "(not set)"
          } else {
            &self.audio_path
          },
          Style::default().fg(Color::Cyan),
        ),
      ]),
      Line::from(vec![
        Span::raw("Aspect: "),
        Span::styled(aspect.label, Style::default().fg(Color::Cyan)),
      ]),
      Line::from(vec![
        Span::raw("Size:   "),
        Span::styled(size.label, Style::default().fg(Color::Cyan)),
      ]),
      Line::from(vec![
        Span::raw("Output: "),
        Span::styled(
          format!("{}x{}", width, height),
          Style::default().fg(Color::Cyan),
        ),
      ]),
      Line::from(vec![
        Span::raw("Format: "),
        Span::styled("MP4 (H.264 + AAC)", Style::default().fg(Color::Cyan)),
      ]),
      Line::from(vec![
        Span::raw("CRF:    "),
        Span::styled("18 (visually lossless)", Style::default().fg(Color::Cyan)),
      ]),
      Line::from(""),
      Line::from(Span::styled(
        "Press Enter to render  |  ← or Esc to go back",
        Style::default().fg(Color::DarkGray),
      )),
    ];

    let paragraph = Paragraph::new(lines).wrap(Wrap { trim: true });
    frame.render_widget(paragraph, inner);
  }

  fn render_rendering(&self, frame: &mut Frame, area: Rect) {
    let block = Block::default()
      .title(" Rendering ")
      .title_alignment(Alignment::Center)
      .borders(Borders::ALL)
      .border_type(BorderType::Rounded)
      .border_style(Style::default().fg(Color::Yellow));

    let inner = block.inner(area);
    frame.render_widget(block, area);

    let chunks = Layout::default()
      .direction(Direction::Vertical)
      .constraints([
        Constraint::Length(3),
        Constraint::Length(3),
        Constraint::Length(1),
        Constraint::Min(0),
      ])
      .split(inner);

    if let Some(ref info) = self.current_progress {
      let pct = info.percent.unwrap_or(0.0) as f64;
      let gauge = Gauge::default()
        .ratio(pct / 100.0)
        .gauge_style(Style::default().fg(Color::Cyan))
        .label(format!("{:.0}%", pct));
      frame.render_widget(gauge, chunks[0]);

      let time_str = format!(
        "{:02}:{:02}",
        (info.time_sec / 60.0) as u32,
        (info.time_sec % 60.0) as u32,
      );
      let stats = Paragraph::new(format!(
        "{}  |  {:.0} fps  |  {:.1}x",
        time_str, info.fps, info.speed
      ))
      .style(Style::default().fg(Color::Cyan))
      .alignment(Alignment::Center);
      frame.render_widget(stats, chunks[1]);
    } else {
      let spinner = Paragraph::new("Starting...")
        .style(
          Style::default()
            .fg(Color::Cyan)
            .add_modifier(Modifier::BOLD),
        )
        .alignment(Alignment::Center);
      frame.render_widget(spinner, chunks[0]);
    }

    let hint = Paragraph::new("Rendering...  Esc to cancel (render continues in bg)")
      .style(Style::default().fg(Color::DarkGray))
      .alignment(Alignment::Center);
    frame.render_widget(hint, chunks[3]);
  }

  fn render_done(&self, frame: &mut Frame, area: Rect) {
    let block = Block::default()
      .title(" Result ")
      .title_alignment(Alignment::Center)
      .borders(Borders::ALL)
      .border_type(BorderType::Rounded)
      .border_style(Style::default().fg(Color::Green));

    let inner = block.inner(area);
    frame.render_widget(block, area);

    let mut lines = vec![];

    if let Some(ref err) = self.error {
      lines.push(Line::from(Span::styled(
        format!("Error: {err}"),
        Style::default().fg(Color::Red),
      )));
    }

    if let Some(ref path) = self.result {
      lines.push(Line::from(vec![
        Span::raw("Output: "),
        Span::styled(path.clone(), Style::default().fg(Color::Green)),
      ]));
    }

    if let Some(ref cmd) = self.command {
      lines.push(Line::from(""));
      lines.push(Line::from(Span::styled(
        "FFmpeg command:",
        Style::default().fg(Color::DarkGray),
      )));
      lines.push(Line::from(Span::styled(
        cmd.clone(),
        Style::default().fg(Color::Cyan),
      )));
    }

    lines.push(Line::from(""));
    lines.push(Line::from(Span::styled(
      "Press any key to exit",
      Style::default().fg(Color::DarkGray),
    )));

    let paragraph = Paragraph::new(lines).wrap(Wrap { trim: true });
    frame.render_widget(paragraph, inner);
  }
}
