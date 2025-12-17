import { randomUUID } from "node:crypto";

export class VirtualSensor {
  public readonly id: string;
  public name: string;
  public lat: number;
  public lon: number;
  public userId: string;
  public active: boolean;

  constructor(
    name: string, 
    lat: number, 
    lon: number, 
    userId: string, 
    id?: string,
    active: boolean = true
  ) {
    this.name = name;
    this.lat = lat;
    this.lon = lon;
    this.userId = userId;
    this.active = active;
    this.id = id || randomUUID();
  }
}