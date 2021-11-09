import mysql.connector
from drones import Drone, DroneStore
from operators import Operator, OperatorStore
from datetime import date

class Application(object):
    """ Main application wrapper for processing input. """

    def __init__(self, conn):
        self._conn = conn
        self._drones = DroneStore(conn)
        self._operators = OperatorStore(conn)
        self._commands = {
            'list': self.list,
            'add': self.add,
            'update': self.update,
            'remove': self.remove,
            'allocate': self.allocate,
            'help': self.help,
        }

    def main_loop(self):
        print('Welcome to DALSys')
        cont = True
        while cont:
            val = input('> ').strip()
            cmd = None
            args = {}
            if len(val) == 0:
                continue

            try:
                parts = val.split(' ')
                strt = None
                nd = None
                rpart = []
                for ind, part in enumerate(parts):
                    if part.find("'") != -1 and part.rfind("'") == part.find("'"): #if it is in the part start 'find'
                        if strt == None:
                            strt = ind
                        else:
                            nd = ind
                            parts[strt] = parts[strt] + " " + parts[nd]
                            rpart.append(part)
                    elif part.rfind("'") != part.find("'"):
                        strt = ind
                        nd = ind
                    elif (strt != None) and (nd == None):
                        parts[strt] = parts[strt] + " " + parts[ind]
                        rpart.append(part)
                    else:
                            parts[ind] = part.lower()
                for p in rpart:
                    parts.remove(p)
                if parts[0] == 'quit':
                    cont = False
                    print('Exiting DALSys')
                else:
                    cmd = self._commands[parts[0]]
            except KeyError:
                print('!! Unknown command "%s" !!' % (val))

            if cmd is not None:
                args = parts[1:]
                try:
                    cmd(args)
                except Exception as ex:
                    print('!! %s !!' % (str(ex)))

    def add(self, args):
        """ Adds a new drone. """
        if args == []:                                                 #check inputs
            raise Exception("name is required")
        elif len(args) < 2:
            raise Exception("class is required")
            
        if args[1][7:] == '1' or args[1][7:] == '2':
            dr = Drone(args[0], args[1][7:])                                            #create drone to add
            if len(args) > 2:                                                           #check for rescue flag
                dr.rescue = '1'
            else:
                dr.rescue = '0'                    
            self._drones.add(dr)                                                        #add to store
        else:
            raise Exception("Drone class is invalid")                                   #if not 1 or 2, it is an invalid class

    def allocate(self, args):
        """ Allocates a drone to an operator. """
        if args != []:
            drone = self._drones.get(int(args[0]))
            if drone == None:
                raise Exception("Unknown drone")
            elif len(args) < 2:
                raise Exception("Operator name required")
            name = args[1].split(' ')
            cursor = self._conn.cursor()
            op = self._operators.get(name[0][1:] + " " + name[1][:-1])    
            if op == None:                                                              #if operator does not exist, opt for creation; default yes
                resp = ''
                while not (resp.lower() == 'y' or resp.lower() == 'n'):
                    resp = input("Operator does not exist, do you want to add operator [Y/n]? ") or 'Y'
                if resp.lower() == 'n':
                    raise Exception("Allocation cancelled")
                else:
                    op = Operator(name[0][1:], name[1][:-1], date.today(), drone.class_type, drone.rescue)
                    
                    """Can implement add operator"""
                    
                    q = "INSERT INTO operator (First_Name, Last_Name, Drone_License, Rescue_Endorsement) VALUES ('"+ op.first_name + "', '" + op.family_name + "', " + str(op.drone_license) + ", " + str(op.rescue_endorsement) + ")"
                    
                    cursor.execute(q)
                    
            if drone.operator != None:                                                  #if a drone has an operator display message, expect input; default yes
                dop = self._operators.get(drone.operator)
                print("- drone already allocated to " + dop.first_name + " " + dop.family_name)
                resp = ''
                while not (resp.lower() == 'y' or resp.lower() == 'n'):
                    resp = input("Do you want to continue [Y/n]?") or 'Y'
                if resp.lower == 'n':
                    raise Exception("Allocation cancelled")

            action = self._drones.allocate(drone, op)
            
            if action.messages != []:
                print("Validation errors:")
                for m in action.messages:
                    print("-" + m)
                resp = ''
                while not (resp.lower() == 'y' or resp.lower() == 'n'):
                    resp = input("Do you want to continue [Y/n]?") or 'Y'
                if resp.lower == 'n':
                    raise Exception("Allocation cancelled")
                else:
                    if any('license' in m for m in action.messages):
                        q = "UPDATE operator SET Drone_License = " + str(drone.class_type) + " WHERE ID = " + str(op.id)
                        cursor.execute(q)
                        
                    if any('rescue' in m for m in action.messages):
                        q = "UPDATE operator SET Rescue_Endorsement = 1 WHERE ID = " + str(op.id)
                        cursor.execute(q)
            
            
            action.commit()
            cursor.close()
            print("Drone allocated to "+ args[1])
        elif args == []:
            raise Exception("ID is required")
        elif len(args) == 1:
            raise Exception("Operator is required")
        


    def help(self, args):
        """ Displays help information. """
        print("Valid commands are:")
        print("* list [- class =(1|2)] [- rescue ]")
        print("* add 'name ' -class =(1|2) [- rescue ]")
        print("* update id [- name ='name '] [- class =(1|2)] [- rescue ]")
        print("* remove id")
        print("* allocate id 'operator'")

    def list(self, args):
        """ Lists all the drones in the system. """

        li = self._drones.list_all()                                          #retrieve a list of all drones
        pli =[]                                                                 #create a print list
        if args == []:                                                          #if no arguments, print all
            pli = li
            print('ID\tName\t\tClass\tRescue\tOperator')                        #print headers for all drones
        elif any('-class' in arg for arg in args):                              #if class argument is present, filter class
            i = [a for a, s in enumerate(args) if '-class' in s]
            if not ((args[i[0]][7:] == '1') or (args[i[0]][7:] == '2')):
                raise Exception("Unknown drone class " + args[i[0]][7:])
            for l in li:
                if l[2] == 'One' and args[i[0]][7:] == '1':
                    pli.append(l)
                elif l[2] == 'Two' and args[i[0]][7:] == '2':
                    pli.append(l)
        elif any('-rescue' in arg for arg in args):                             #if rescue argument is present, filter rescue bool
            i = [a for a, s in enumerate(args) if '-rescue' in s]
            for l in li:
                if l[3] == 'Yes':
                    pli.append(l)            
        else:
            raise Exception("Unknown argument")                            #raise exception on bad argument
        
        if len(pli) == 0:                                                       #if no drones, raise error
            raise Exception("There are no drones for this criteria")
        
        for pl in pli:                                                          #print drones
            for p in pl:
                print(p, end='\t')
                if len(str(p)) < 8 and p == pl[1]:
                    print('\t', end='')
            print()
        if len(pli) == 1:
            print("1 drone listed")
        else:
            print(str(len(pli)) + " drones listed")
        

    def remove(self, args):
        """ Removes a drone. """
        if args == []:
            raise Exception("ID is required")
        drone = self._drones.get(int(args[0]))
        if drone != None:
            self._drones.remove(drone)
        else:
            raise Exception("Unknown drone")

    def update(self, args):
        """ Updates the details for a drone. """
        n=''
        c=''
        r=''
        if args == []:
            raise Exception("ID is required")
        drone = self._drones.get(int(args[0]))
        if drone != None:
            query = "UPDATE drone SET "
            change = 0                                                          #default change value is false
            cnt = 0
            if any('-name' in arg for arg in args):
                i = [a for a, s in enumerate(args) if '-name' in s]             #get index of name in args
                val = args[i[0]][7:-1]                                               #create a variable for the name
                if val != drone.name:
                    query += "Name = '" + val + "'"
                    n = 'name to ' + val + ' '
                    change = 1
                    cnt += 1
                    
            if any('-class' in arg for arg in args):                            #check for class arg
                i = [a for a, s in enumerate(args) if '-class' in s]
                val = args[i[0]][7:]
                if val == '1' or val == '2':
                    if int(val) != drone.class_type:
                        if cnt > 0:
                            query += ", "
                        else:
                            query += " "
                        query += "Class_Type = " + val
                        c = 'class to ' + val + " "
                        change = 1
                        cnt += 1
                else:
                    raise Exception("Invalid class, class type 1 or 2")
                
            if any('-rescue' in arg for arg in args):
                if drone.rescue != 1:
                    if cnt > 0:
                        query += ", "
                    else:
                        query += " "
                    query += "Rescue = 1"
                    change = 1
                    r = 'rescue to yes'
            else:                                                       #if the -rescue arg is omitted, clear rescue
                if drone.rescue != 0:                                     #only enter query for rescue if it is to be changed; otherwise it is redundant
                    if cnt > 0:
                        query += ", "
                    else:
                        query += " "
                        
                    query += "Rescue = 0"
                    change = 1
                    r = 'rescue to no'
            if change == 1:                                                 #if changed, run query        
                query += " WHERE ID = " + str(drone.id)
            else:
                raise Exception("No changes detected")
        else:
            raise Exception("Unknown drone")
        cursor = self._conn.cursor()
        
        
        cursor.execute(query)
        
        cursor.close()
        if change == 1:
            print("Updated drone with ID " + str(drone.id))
            print('- set ' + n + c + r)


if __name__ == '__main__':
    print('Connecting to database...')
    """Connection for personal DB"""
    conn = mysql.connector.connect(host='localhost',
                                   port=3306,
                                   user='root',
                                   database='dronestore',
                                   password='Signum34',
                                   charset='utf8mb4',
                                   autocommit=True)
                                   
    """Connection for uni DB         
    conn = mysql.connector.connect(host='studdb-mysql.fos.auckland.ac.nz',
                                   user='pjiv657',
                                   password='93d6d07d',
                                   database='stu_pjiv657_COMPSCI_280_C_S2_2019')
    """
    
    print('...connected')
    app = Application(conn)
    app.main_loop()
    conn.close()
