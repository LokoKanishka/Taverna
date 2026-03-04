import sqlite3

def create_database():
    conn = sqlite3.connect('taverna_stats.db')
    cursor = conn.cursor()

    # Tabla de Personajes (NPCs/Player)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS characters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        is_player BOOLEAN DEFAULT 0
    )
    ''')

    # Tabla de Monedas
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS economy (
        character_id INTEGER PRIMARY KEY,
        gold INTEGER DEFAULT 0,
        silver INTEGER DEFAULT 0,
        copper INTEGER DEFAULT 0,
        FOREIGN KEY(character_id) REFERENCES characters(id)
    )
    ''')

    # Tabla de Inventario/Objetos
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS inventory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        character_id INTEGER,
        item_name TEXT NOT NULL,
        quantity INTEGER DEFAULT 1,
        description TEXT,
        FOREIGN KEY(character_id) REFERENCES characters(id)
    )
    ''')

    # Tabla de Lealtad / Relaciones
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS loyalty (
        npc_id INTEGER,
        player_id INTEGER,
        loyalty_score INTEGER DEFAULT 0, -- Rango: -100 (Odio) a 100 (Devoción)
        relationship_status TEXT DEFAULT 'Neutral',
        notes TEXT,
        PRIMARY KEY (npc_id, player_id),
        FOREIGN KEY(npc_id) REFERENCES characters(id),
        FOREIGN KEY(player_id) REFERENCES characters(id)
    )
    ''')

    conn.commit()
    conn.close()
    print("Database 'taverna_stats.db' created successfully with schemas for economy, inventory, and loyalty.")

if __name__ == '__main__':
    create_database()
