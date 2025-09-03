import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Preferences } from '@capacitor/preferences';
import { environment } from 'src/environments/environment.prod';

@Injectable({ providedIn: 'root' })
export class GeneralService {
  private baseUrl = (environment as any).apiURL || (environment as any).apiUrl;

  constructor(private http: HttpClient) {}

  // ==========================
  // Helpers Preferences
  // ==========================
  private async setPref(key: string, value: any): Promise<void> {
    const str = typeof value === 'string' ? value : JSON.stringify(value);
    await Preferences.set({ key, value: str });
  }

  private async getPref<T = string>(key: string): Promise<T | null> {
    const { value } = await Preferences.get({ key });
    if (value == null) return null;

    // intenta parsear JSON; si falla, devuelve el string tal cual
    try { return JSON.parse(value) as T; } catch { return value as any as T; }
  }

  private async removePref(key: string): Promise<void> {
    await Preferences.remove({ key });
  }

  // ==========================
  // Métodos de Autenticación
  // ==========================
  async setAuthToken(token: string) { await this.setPref('authToken', token); }
  async getAuthToken(): Promise<string | null> {
    const raw = await Preferences.get({ key: 'authToken' });
    return raw.value ?? null; // token siempre string
  }
  async clearAuth() {
    await this.removePref('authToken');
    await this.removePref('userRoles');
    await this.removePref('username');
    await this.removePref('userId');
  }

  async setUserRoles(roles: string[]) { await this.setPref('userRoles', roles); }
  async getUserRoles(): Promise<string[]> {
    const r = await this.getPref<string[] | string>('userRoles');
    if (!r) return [];
    return Array.isArray(r) ? r : (() => { try { return JSON.parse(r) } catch { return [] } })();
  }

  async setUsername(username: string) { await this.setPref('username', username); }
  async getUsername(): Promise<string | null> { return await this.getPref<string>('username'); }

  async setUserId(userId: number | string) { await this.setPref('userId', String(userId)); }
  async getUserId(): Promise<string | null> {
    const v = await this.getPref<string>('userId');
    return v ?? null;
  }

  // ==========================
  // Métodos HTTP base
  // ==========================
  get<T>(endpoint: string, params?: HttpParams): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${endpoint}`, { params });
  }
  getById<T>(endpoint: string, id: number | string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${endpoint}/${id}`);
  }
  post<T>(endpoint: string, body: unknown): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${endpoint}`, body);
  }
  put<T>(endpoint: string, body: unknown): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${endpoint}`, body);
  }
  delete<T>(endpoint: string, id: number | string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}/${endpoint}/${id}`);
  }
}
