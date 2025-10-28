import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError ,BehaviorSubject} from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Preferences } from '@capacitor/preferences';
import { environment } from 'src/environments/environment.prod';
import { ApiResponse, Client, User,Vehicle } from '../models/IEntitys';

@Injectable({ providedIn: 'root' })
export class GeneralService {
    // resetPassword(arg0: { oldPassword: string; newPassword: string; }) {
    //     throw new Error('Method not implemented.');
    // }
    // Paso 1: solicitar código
  requestPasswordReset(email: string) {
    return this.post<any>('PasswordRecovery/request', { email });
  }

  verifyCode(email: string, code: string) {
    return this.post<any>('PasswordRecovery/verify', { email, code });
  }

  resetPassword(email: string, code: string, newPassword: string) {
    return this.post<any>('PasswordRecovery/reset', { email, code, newPassword });
  }
  private baseUrl = (environment as any).apiURL || (environment as any).apiUrl;

  constructor(private http: HttpClient) {}
  private usernameSubject = new BehaviorSubject<string | null>(null);
  username$ = this.usernameSubject.asObservable();

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
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as any as T;
    }
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
    return raw.value ?? null;
  }
  async clearAuth() {
    await this.removePref('authToken');
    await this.removePref('userRoles');
    await this.removePref('username');
    await this.removePref('userId');
     await this.removePref('clientId'); // 👈
  }

  async setUserRoles(roles: string[]) { await this.setPref('userRoles', roles); }
  async getUserRoles(): Promise<string[]> {
    const r = await this.getPref<string[] | string>('userRoles');
    if (!r) return [];
    return Array.isArray(r) ? r : (() => { try { return JSON.parse(r) } catch { return [] } })();
  }

  async setUsername(username: string) {
    await this.setPref('username', username);
    this.usernameSubject.next(username); 
  }

  async getUsername(): Promise<string | null> {
    const name = await this.getPref<string>('username');
    this.usernameSubject.next(name);
    return name;
  }

  async setUserId(userId: number | string) { await this.setPref('userId', String(userId)); }
  async getUserId(): Promise<string | null> {
    const v = await this.getPref<string>('userId');
    return v ?? null;
  }

  async setClientId(clientId: number | string) {
  await this.setPref('clientId', String(clientId));
}
async getClientId(): Promise<number | null> {
  const v = await this.getPref<string>('clientId');
  return v ? Number(v) : null;
}

  // ==========================
  // Manejo de errores HTTP
  // ==========================
  private handleError(error: HttpErrorResponse) {
    // si el backend manda { message: "...", errors: [...] }
    const backendMsg = error?.error?.message;
    const backendErrors = error?.error?.errors;

    const message =
      backendMsg ||
      (Array.isArray(backendErrors) ? backendErrors.join(', ') : null) ||
      error.message ||
      'Ocurrió un error inesperado';

    return throwError(() => ({ message }));
  }

  // ==========================
  // Métodos HTTP base
  // ==========================
  get<T>(endpoint: string, params?: HttpParams): Observable<T> {
    return this.http
      .get<T>(`${this.baseUrl}/${endpoint}`, { params })
      .pipe(catchError((err) => this.handleError(err)));
  }

  getById<T>(endpoint: string, id: number | string): Observable<T> {
    return this.http
      .get<T>(`${this.baseUrl}/${endpoint}/${id}`)
      .pipe(catchError((err) => this.handleError(err)));
  }

// lo que se muestra en el profile

  getUserById(id: number) {
    return this.getById<User>('User', id);
  }
// getVehiclesByClientId(clientId: number) {
//   return this.get<ApiResponse<Vehicle[]>>(`Client/by-client?clientId=${clientId}`);
// }
getClientWithVehicles(clientId: number) {
  return this.get<ApiResponse<Client>>(`Client/by-client?clientId=${clientId}`);
}
  updateUser(user: Partial<User>) {
    return this.put<User>('User', user);
  }


// --------------------------------------------------------------------------------

  post<T>(endpoint: string, body: unknown): Observable<T> {
    return this.http
      .post<T>(`${this.baseUrl}/${endpoint}`, body)
      .pipe(catchError((err) => this.handleError(err)));
  }

  put<T>(endpoint: string, body: unknown): Observable<T> {
    return this.http
      .put<T>(`${this.baseUrl}/${endpoint}`, body)
      .pipe(catchError((err) => this.handleError(err)));
  }

  delete<T>(endpoint: string, id: number | string): Observable<T> {
    return this.http
      .delete<T>(`${this.baseUrl}/${endpoint}/${id}`)
      .pipe(catchError((err) => this.handleError(err)));
  }
  getClientByUserId(userId: number) {
  return this.get<ApiResponse<Client>>(`Client/by-user/${userId}`);
}


  

}
