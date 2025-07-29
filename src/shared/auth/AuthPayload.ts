export interface AuthPayload {
    id: string;
    username: string;
    email: string;
    roles: {
      name: string,
      id: string,  
    }[]
}