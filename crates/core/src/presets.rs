pub struct AspectPreset {
  pub id: &'static str,
  pub label: &'static str,
  pub ratio: (u32, u32),
}

pub struct SizePreset {
  pub id: &'static str,
  pub label: &'static str,
  pub long_edge: u32,
}

pub const ASPECT_PRESETS: &[AspectPreset] = &[
  AspectPreset { id: "16:9", label: "16:9 Landscape", ratio: (16, 9) },
  AspectPreset { id: "9:16", label: "9:16 Vertical", ratio: (9, 16) },
  AspectPreset { id: "1:1", label: "1:1 Square", ratio: (1, 1) },
];

pub const SIZE_PRESETS: &[SizePreset] = &[
  SizePreset { id: "720", label: "720p", long_edge: 1280 },
  SizePreset { id: "1080", label: "1080p", long_edge: 1920 },
  SizePreset { id: "2160", label: "4K", long_edge: 3840 },
];

pub fn compute_size(aspect: &AspectPreset, size: &SizePreset) -> (u32, u32) {
  let (w, h) = aspect.ratio;
  if w >= h {
    let height = (size.long_edge * h) / w;
    (size.long_edge, height)
  } else {
    let width = (size.long_edge * w) / h;
    (width, size.long_edge)
  }
}
