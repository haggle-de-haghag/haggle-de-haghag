import { FirebaseOptions } from "firebase/app";

declare module "env" {
    const firebaseConfig: FirebaseOptions;
}