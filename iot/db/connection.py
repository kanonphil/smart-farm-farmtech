import mysql.connector

def get_connection():
  return mysql.connector.connect(
    host="192.168.30.147",
    port=3306,
    database="smartfarm",
    user="farmtech",
    password="farmtech"
  )
