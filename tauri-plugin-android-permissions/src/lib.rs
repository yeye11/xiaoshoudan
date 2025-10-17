use tauri::{
  plugin::{Builder, TauriPlugin},
  Manager, Runtime,
};

pub use models::*;

#[cfg(desktop)]
mod desktop;
#[cfg(mobile)]
mod mobile;

mod commands;
mod error;
mod models;

pub use error::{Error, Result};

#[cfg(desktop)]
use desktop::AndroidPermissions;
#[cfg(mobile)]
use mobile::AndroidPermissions;

/// Extensions to [`tauri::App`], [`tauri::AppHandle`] and [`tauri::Window`] to access the android-permissions APIs.
pub trait AndroidPermissionsExt<R: Runtime> {
  fn android_permissions(&self) -> &AndroidPermissions<R>;
}

impl<R: Runtime, T: Manager<R>> crate::AndroidPermissionsExt<R> for T {
  fn android_permissions(&self) -> &AndroidPermissions<R> {
    self.state::<AndroidPermissions<R>>().inner()
  }
}

/// Initializes the plugin.
pub fn init<R: Runtime>() -> TauriPlugin<R> {
  Builder::new("android-permissions")
    .invoke_handler(tauri::generate_handler![commands::ping])
    .setup(|app, api| {
      #[cfg(mobile)]
      let android_permissions = mobile::init(app, api)?;
      #[cfg(desktop)]
      let android_permissions = desktop::init(app, api)?;
      app.manage(android_permissions);
      Ok(())
    })
    .build()
}
