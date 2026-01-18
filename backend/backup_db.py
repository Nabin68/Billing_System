import shutil
from datetime import datetime
import os

DB_FILE = "billing.db"
BACKUP_DIR = "backups"

def backup_database():
    if not os.path.exists(BACKUP_DIR):
        os.makedirs(BACKUP_DIR)

    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    backup_file = f"{BACKUP_DIR}/billing_backup_{timestamp}.db"

    shutil.copy(DB_FILE, backup_file)
    print(f"Backup created: {backup_file}")

if __name__ == "__main__":
    backup_database()
