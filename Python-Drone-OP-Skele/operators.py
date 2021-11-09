from datetime import date

class Operator(object):
    """ Stores details on an operator. """

    def __init__(self, name = None, last_name = None, dob = None, lic = None, resc_end = None, ops = None, drone = None):
        self.id = 0
        self.first_name = name
        self.family_name = last_name
        self.date_of_birth = dob
        self.drone_license = lic
        self.rescue_endorsement = resc_end
        self.operations = ops
        self.drone = drone


class OperatorAction(object):
    """ A pending action on the OperatorStore. """

    def __init__(self, operator, commit_action):
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

        self._commit_action(self.operator)
        self._committed = True


class OperatorStore(object):
    """ Stores the operators. """

    def __init__(self, conn=None):
        self._operators = {}
        self._last_id = 0
        self._conn = conn
        
        cursor = self._conn.cursor()
        cursor.execute("SELECT * FROM operator")
        rows = cursor.fetchall()
        for r in rows:
            op = Operator(r[1], r[2], r[3], r[4], r[5], r[6], r[7])
            op.id = r[0]
            self._last_id += 1
            self._operators[op.id] = op
        
        

    def add(self, operator):
        """ Starts adding a new operator to the store. """
        action = OperatorAction(operator, self._add)
        check_age = True
        if operator.first_name is None:
            action.add_message("First name is required")
        if operator.date_of_birth is None:
            action.add_message("Date of birth is required")
            check_age = False
        if operator.drone_license is None:
            action.add_message("Drone license is required")
        if operator.rescue_endorsement:
            if operator.operations <5:
                action.add_message("Operator must have been involved in five prior rescue missions")
        else:
            if check_age and operator.drone_license == 2:
                today = date.today()
                age = today.year - operator.date_of_birth.year - \
                    ((today.month, today.day) < (
                        operator.date_of_birth.month, operator.date_of_birth.day))
                if age < 20:
                    action.add_message(
                        "Operator should be at least twenty to hold a class 2 license")
        return action

    def _add(self, operator):
        """ Adds a new operator to the store. """
        
            
        cursor = self._conn.cursor()
        q = "INSERT INTO operator (First_Name, Last_Name, Drone_License, Operations, Rescue_Endorsement) VALUES ("+ operator.first_name + ", " + operator.family_name + ", " + str(operator.drone_license) + ", " + str(operator.operations) + ", " +  str(operator.rescue_endorsement) + ")"
        cursor.execute(q)
        
        cursor.execute("SELECT * FROM operator ORDER BY ID DESC LIMIT 1")                  #Get last id (id created from add)
        row = cursor.fetchall()
        row = row[0]
        
        if operator.id in self._operators:
            raise Exception('Operator already exists in store')
        else:
            self._last_id = row[0]
            operator.id = self._last_id
            self._operators[operator.id] = operator
        
        cursor.close()


    def remove(self, operator):
        """ Removes a operator from the store. """
        if not operator.id in self._operators:
            raise Exception('Operator does not exist in store')
        else:
            del self._operators[operator.id]

    def get(self, id):
        """ Retrieves a operator from the store by its ID or name. """
        cursor = self._conn.cursor()
        if isinstance(id, str):
            name = id.split(' ')
            query = "SELECT * FROM operator WHERE First_Name LIKE '" + name[0] + "' AND Last_Name LIKE '" + name[1] + "'"
        else:
            query = "SELECT * FROM operator WHERE ID =" + str(id)
            
            
        cursor.execute(query)
        r = cursor.fetchall()
        if r != []:
            r = r[0]
            cursor.close()
            op = Operator(r[1], r[2], r[3], r[4], r[5], r[6], r[7])
            op.id = r[0]
            return op
        else:
            return None


    def list_all(self):
        """ Lists all the _operators in the system. """
        cursor = self._conn.cursor()
        query = "SELECT operator.ID, First_Name, Last_Name, Date_of_Birth, CASE WHEN Drone_License = 1 THEN 'One' WHEN Drone_License = 2 THEN 'Two' END, CASE WHEN Rescue_Endorsement = 0 THEN 'No' ELSE 'Yes' END, CASE WHEN Operations IS NULL THEN '0' ELSE Operations END, CASE WHEN Drone IS NOT NULL THEN CONCAT(drone.ID, ' ', drone.Name) ELSE '<None>' END FROM operator LEFT JOIN drone ON operator.Drone = drone.ID ORDER BY operator.ID DESC"
        cursor.execute(query)
        li = cursor.fetchall()
        cursor.close()
        return li                       #return a list of all drones in store

    def save(self, operator):
        """ Saves the store to the database. """
        cursor = self._conn.cursor()
        q = "UPDATE operator SET First_Name = " + operator.first_name + ", Last_Name = " + operator.family_name + ", Drone_License = " + str(operator.drone_license) + ", Rescue_Endorsement = " + str(operator.rescue_endorsement) + ", Operations = " + str(operator.operations) + " WHERE ID = " + str(operator.id)
        cursor.execute(q)
        cursor.close()
