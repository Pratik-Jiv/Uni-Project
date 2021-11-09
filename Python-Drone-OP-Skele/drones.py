class Drone(object):
    """ Stores details on a drone. """

    def __init__(self, name, class_type=1, rescue=False, operator=None):
        self.id = 0
        self.name = name
        self.class_type = class_type
        self.rescue = rescue
        self.operator = operator

class DroneAction(object):
    """ A pending action on the DroneStore. """

    def __init__(self, drone, operator, commit_action):
        self.drone = drone
        self.operator = operator
        self.messages = []
        self._commit_action = commit_action
        self._committed = False


    def add_message(self, message):
        """ Adds a message to the action. """
        self.messages.append(message)

    def is_valid(self):
        """ Returns True if the action is valid, False otherwise. """
        return len(self.messages) == 0

    def commit(self):
        """ Commits (performs) this action. """
        if self._committed:
            raise Exception("Action has already been committed")

        self._commit_action(self.drone, self.operator)
        self._committed = True


class DroneStore(object):
    """ DroneStore stores all the drones for DALSys. """

    def __init__(self, conn=None):
        self._conn = conn
        self._drones = {}
        self._last_id = 0
        
        
        #get all current drones from db and store under self._drones
        cursor = self._conn.cursor()
        cursor.execute("SELECT * FROM drone")
        rows = cursor.fetchall()
        for r in rows:
            drone = Drone(r[1], r[2], r[3], r[4])
            drone.id = r[0]
            self._last_id = drone.id
            self._drones[drone.id] = drone
            
            
    def add(self, drone):
        """ Adds a new drone to the store. """
        cursor = self._conn.cursor()
        na = drone.name
        cl = drone.class_type
        re = drone.rescue
        r = ''
        if re == '1':
            r = 'rescue '
        query = "INSERT INTO drone (Name, Class_Type, Rescue) VALUES (" + na + ", "+ str(cl) +", " +  str(re) + ")"
        
        drone.name = na[1:-1]
        
        cursor.execute(query)
        
        cursor.execute("SELECT * FROM drone ORDER BY ID DESC LIMIT 1")                  #Get last id (id created from add)
        row = cursor.fetchall()
        row = row[0]
        print("Aded " + r + "drone with ID %04d" % (row[0]))
        cursor.close()
        
        if drone.id in self._drones:
            raise Exception('Drone already exists in store')
        else:
            self._last_id = row[0]														#set last id
            self._drones[row[0]] = drone

    def remove(self, drone):
        """ Removes a drone from the store. """    
        if not drone.id in self._drones:
            raise Exception('Drone does not exist in store')
        else:
            query = "DELETE FROM drone WHERE ID = " + str(drone.id)
            cursor = self._conn.cursor()
            cursor.execute(query)
            del self._drones[drone.id]
            cursor.close()
            print("Drone removed")

    def get(self, id):
        """ Retrieves a drone from the store by its ID. """
        if id in self._drones:
            return self._drones[id]
        else:
            return None

    def list_all(self):
        """ Lists all the drones in the system. """
        cursor = self._conn.cursor()
        query = 'SELECT drone.ID, Name, CASE WHEN Class_Type = 1 THEN "One" WHEN Class_Type = 2 THEN "Two" END AS Class, CASE WHEN Rescue = 0 THEN "No" WHEN Rescue = 1 THEN "Yes" END AS Rescue, CASE WHEN Operator IS NOT NULL AND Last_Name  IS NOT NULL THEN CONCAT(First_Name, " ", Last_Name) WHEN Operator IS NOT NULL THEN First_Name ELSE "<None>" END FROM drone LEFT JOIN operator ON operator.ID = drone.Operator ORDER BY drone.ID DESC'
        cursor.execute(query)
        li = cursor.fetchall()
        cursor.close()
        return li                       #return a list of all drones in store

    def allocate(self, drone, operator):
        """ Starts the allocation of a drone to an operator. """
        action = DroneAction(drone, operator, self._allocate)
        if operator.drone is not None:
            action.add_message("Operator can only control one drone")
        if drone.class_type != operator.drone_license:
            action.add_message("Operator does not have correct drone license")
        if (drone.rescue == True) & (operator.rescue_endorsement == False):
            action.add_message("Operator does not have rescue endorsement")
        
        return action

    def _allocate(self, drone, operator):
        """ Performs the actual allocation of the operator to the drone. """
        if operator.drone is not None:
            # If the operator had a drone previously, we need to clean it so it does not
            # hold an incorrect reference
            dr = operator.drone
            cursor = self._conn.cursor()
            q = "UPDATE drone SET Operator = NULL WHERE ID = " + str(dr)
            
            q2 = "UPDATE operator SET Drone = NULL WHERE ID = " + str(operator.id)
            
            cursor.execute(q)
            cursor.execute(q2)

        operator.drone = drone.id
        drone.operator = operator.id

        self._save(drone)

    def _save(self, drone):
        """ Saves the drone to the database. """
        cursor = self._conn.cursor()
        q = "UPDATE drone SET Operator = " + str(drone.operator) + " WHERE ID = " + str(drone.id)
        q2 = "UPDATE operator SET Drone = " + str(drone.id) + " WHERE ID = " + str(drone.operator)
        cursor.execute(q)
        cursor.execute(q2)
        cursor.close()
        
    def save(self, drone):
        cursor = self._conn.cursor()
        q = "UPDATE drone SET Name = " + drone.name + ", Class_Type = " + str(drone.class_type) + ", Rescue = " + str(drone.rescue) + " WHERE ID = " + str(drone.id) 
        cursor.execute(q)
        cursor.close()
