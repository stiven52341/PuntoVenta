import { IEntity } from "../services/api/api-core/api-core.service";

export interface IProduct extends IEntity<Number> {
  name: string;
  idBaseUnit?: number;
  category?: string;
  description?: string;
  isFavorite?: boolean;
}
