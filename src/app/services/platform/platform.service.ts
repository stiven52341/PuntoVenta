import { Injectable } from "@angular/core";
import { Capacitor } from "@capacitor/core";

@Injectable({
  providedIn: "root",
})
export class PlatformService {
  constructor() {}

  public getPlatform(): "android" | "ios" | "web" {
    const platform = Capacitor.getPlatform();
    switch (platform) {
      case "android":
        return "android";
      case "ios":
        return "ios";
      default:
        return "web";
    }
  }

  public isAndroid(): boolean {
    return this.getPlatform() == "android";
  }
}
