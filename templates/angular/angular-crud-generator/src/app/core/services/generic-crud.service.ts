import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface QueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
}

@Injectable({ providedIn: 'root' })
export class GenericCrudService<T extends { id: string | number }> {
  protected http = inject(HttpClient);
  protected baseUrl = '';

  setBaseUrl(url: string) {
    this.baseUrl = url;
    return this;
  }

  getAll(params?: QueryParams): Observable<PaginatedResponse<T>> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
      if (params.sort) httpParams = httpParams.set('sort', params.sort);
      if (params.order) httpParams = httpParams.set('order', params.order);
      if (params.search) httpParams = httpParams.set('search', params.search);

      if (params.filters) {
        Object.entries(params.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            httpParams = httpParams.set(key, value.toString());
          }
        });
      }
    }

    return this.http.get<PaginatedResponse<T>>(this.baseUrl, { params: httpParams });
  }

  getById(id: string | number): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${id}`);
  }

  create(data: Omit<T, 'id'>): Observable<T> {
    return this.http.post<T>(this.baseUrl, data);
  }

  update(id: string | number, data: Partial<T>): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${id}`, data);
  }

  patch(id: string | number, data: Partial<T>): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  bulkDelete(ids: (string | number)[]): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/bulk-delete`, { ids });
  }

  export(format: 'csv' | 'xlsx', params?: QueryParams): Observable<Blob> {
    let httpParams = new HttpParams().set('format', format);

    if (params?.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value) httpParams = httpParams.set(key, value.toString());
      });
    }

    return this.http.get(`${this.baseUrl}/export`, {
      params: httpParams,
      responseType: 'blob',
    });
  }
}

// Usage example:
// @Injectable({ providedIn: 'root' })
// export class UsersService extends GenericCrudService<User> {
//   constructor() {
//     super();
//     this.setBaseUrl('/api/users');
//   }
// }
