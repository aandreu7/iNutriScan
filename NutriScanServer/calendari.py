#from googleapiclient.discovery import build
#from google.oauth2.credentials import Credentials

def crear_event_calendari(credentials_path, titol, descripcio, data_inici, data_fi):
    """
    Guarda una data al Google Calendar.

    :param credentials_path: Ruta al fitxer de credencials JSON.
    :param titol: Títol de l'esdeveniment.
    :param descripcio: Descripció de l'esdeveniment.
    :param data_inici: Data i hora d'inici de l'esdeveniment (format ISO 8601). exemple: '2023-10-10T10:00:00+02:00'.
    :param data_fi: Data i hora de finalització de l'esdeveniment (format ISO 8601). exemple: '2023-10-10T11:00:00+02:00'.
    :return: ID de l'esdeveniment creat.
    """
    # Carregar les credencials
    creds = Credentials.from_authorized_user_file(credentials_path, ['https://www.googleapis.com/auth/calendar'])

    # Construir el servei de Google Calendar
    service = build('calendar', 'v3', credentials=creds)

        # Detalls de l'esdeveniment
    event_details = {
        'summary': titol,
        'description': descripcio,
        'start': {
            'dateTime': data_inici,
            'timeZone': 'Europe/Madrid',
        },
        'end': {
            'dateTime': data_fi,
            'timeZone': 'Europe/Madrid',
        },
        'colorId': "9"  #tambe podeu especificar un color per l'esdeveniment
        #tambe hi ha 'attendees' per afegir convidats que sembla chulo per a menjars.
    }

    # Crear l'esdeveniment
    event = service.events().insert(calendarId='primary', body=event_detailst).execute()

    print(f"Esdeveniment creat: {event.get('htmlLink')}")
    return event.get('id')