# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

## Network Configuration for API Backend

When running the mobile app in Expo Go or an emulator, it cannot connect to the backend using `localhost`. You must configure `EXPO_PUBLIC_API_URL` correctly.

1. **Find your local IP address**:
   - On Mac: Run `ipconfig getifaddr en0` in the terminal.
   - On Linux/Windows: Run `hostname -I` or `ipconfig`.
2. **Update your `.env`**: Set `EXPO_PUBLIC_API_URL=http://<YOUR_IP>:3000/api` in `mobile/.env`.
3. **Connect to the same network**: Ensure your phone and development machine are on the same WiFi network.
4. **Start the backend properly**: Start your Next.js backend with `next dev -H 0.0.0.0` (which is configured in the root `package.json`'s dev script). This allows it to accept connections from other devices on the network.
5. **Restart Expo**: If you change `.env`, restart Expo and clear the cache by running `npx expo start -c`.
