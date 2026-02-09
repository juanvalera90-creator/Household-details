# Create Desktop Shortcut

## Windows - Create Desktop Shortcut

### Method 1: Right-Click Method

1. Navigate to the `household-expenses` folder
2. Right-click on `START_APP.bat`
3. Select "Send to" → "Desktop (create shortcut)"
4. Rename the shortcut to "Household Expenses" (optional)
5. Right-click the shortcut → "Properties"
6. Click "Change Icon" to choose a custom icon (optional)
7. Click "OK"

Now you can double-click the desktop shortcut to start the app!

### Method 2: Manual Shortcut Creation

1. Right-click on your desktop
2. Select "New" → "Shortcut"
3. Browse to: `C:\Users\juan.valera\Desktop\variance-explainer\household-expenses\START_APP.bat`
   (Or wherever your project is located)
4. Click "Next"
5. Name it "Household Expenses"
6. Click "Finish"

### Optional: Change Icon

1. Right-click the shortcut → "Properties"
2. Click "Change Icon"
3. Browse to: `C:\Windows\System32\shell32.dll` (or any icon file)
4. Select an icon
5. Click "OK"

## Tips

- You can pin the shortcut to your taskbar for even faster access
- The shortcut will open two windows (backend and frontend) - keep them open while using the app
- Use `STOP_APP.bat` to stop all servers when done

