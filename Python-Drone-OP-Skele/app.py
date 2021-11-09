import mysql.connector
import tkinter as tk
from tkinter import ttk, StringVar

from drones import Drone, DroneStore
from operators import Operator, OperatorStore


class Application(object):
    """ Main application view - displays the menu. """

    def __init__(self, conn):
        # Initialise the stores
        self.drones = DroneStore(conn)
        self.operators = OperatorStore(conn)

        # Initialise the GUI window
        self.root = tk.Tk()
        self.root.title('Drone Allocation and Localisation')
        frame = tk.Frame(self.root)
        frame.pack(padx=10, pady=10)

        # Add in the buttons
        drone_button = tk.Button(
            frame, text="View Drones", command=self.view_drones, width=40, padx=5, pady=5)
        drone_button.pack(side=tk.TOP)
        operator_button = tk.Button(
            frame, text="View Operators", command=self.view_operators, width=40, padx=5, pady=5)
        operator_button.pack(side=tk.TOP)
        exit_button = tk.Button(frame, text="Exit System",
                                command=quit, width=40, padx=5, pady=5)
        exit_button.pack(side=tk.TOP)

    def main_loop(self):
        """ Main execution loop - start Tkinter. """
        self.root.mainloop()

    def view_operators(self):
        """ Display the operators. """
        # Instantiate the operators window
        # Display the window and wait
        wnd = OperatorListWindow(self)
        self.root.wait_window(wnd.root)
        print('TODO operators')

    def view_drones(self):
        """ Display the drones. """
        wnd = DroneListWindow(self)
        self.root.wait_window(wnd.root)


class ListWindow(object):
    """ Base list window. """

    def __init__(self, parent, title):
        # Add a variable to hold the stores
        self.drones = parent.drones
        self.operators = parent.operators

        # Initialise the new top-level window (modal dialog)
        self._parent = parent.root
        self.root = tk.Toplevel(parent.root)
        self.root.title(title)
        self.root.transient(parent.root)
        self.root.grab_set()

        # Initialise the top level frame
        self.frame = tk.Frame(self.root)
        self.frame.pack(side=tk.TOP, fill=tk.BOTH,
                        expand=tk.Y, padx=10, pady=10)

    def add_list(self, columns, edit_action):
        # Add the list
        self.tree = ttk.Treeview(self.frame, columns=columns, show='headings')
        for col in columns:
            self.tree.heading(col, text=col.title())
        ysb = ttk.Scrollbar(self.frame, orient=tk.VERTICAL,
                            command=self.tree.yview)
        xsb = ttk.Scrollbar(self.frame, orient=tk.HORIZONTAL,
                            command=self.tree.xview)
        self.tree['yscroll'] = ysb.set
        self.tree['xscroll'] = xsb.set
        self.tree.bind("<Double-1>", edit_action)

        # Add tree and scrollbars to frame
        self.tree.grid(in_=self.frame, row=0, column=0, sticky=tk.NSEW)
        ysb.grid(in_=self.frame, row=0, column=1, sticky=tk.NS)
        xsb.grid(in_=self.frame, row=1, column=0, sticky=tk.EW)

        # Set frame resize priorities
        self.frame.rowconfigure(0, weight=1)
        self.frame.columnconfigure(0, weight=1)

    def close(self):
        """ Closes the list window. """
        self.root.destroy()


class DroneListWindow(ListWindow):
    """ Window to display a list of drones. """

    def __init__(self, parent):
        super(DroneListWindow, self).__init__(parent, 'Drones')

        # Add the list and fill it with data
        columns = ('id', 'name', 'class', 'rescue', 'operator')
        self.add_list(columns, self.edit_drone)
        self.populate_data()

        # Add the command buttons
        add_button = tk.Button(self.frame, text="Add Drone",
                               command=self.add_drone, width=20, padx=5, pady=5)
        add_button.grid(in_=self.frame, row=2, column=0, sticky=tk.E)
        exit_button = tk.Button(self.frame, text="Close",
                                command=self.close, width=20, padx=5, pady=5)
        exit_button.grid(in_=self.frame, row=3, column=0, sticky=tk.E)

    def populate_data(self):
        """ Populates the data in the view. """
        print('Loading data')
        #clear tree (noticible in refreshing)
        for i in self.tree.get_children():
            self.tree.delete(i)       
        
        li = self.drones.list_all()
        for dr in li:
            self.tree.insert('', 'end', values=(dr[0], dr[1], dr[2], dr[3], dr[4]))

    def add_drone(self):
        """ Starts a new drone and displays it in the list. """
        # Start a new drone instance
        print('Creating new drone')
        drone = Drone('<new>')
        # Display the drone
        self.view_drone(drone, self._save_new_drone)

    def _save_new_drone(self, drone):
        """ Saves the drone in the store and updates the list. """
        self.drones.add(drone)
        self.populate_data()

    def edit_drone(self, event):
        """ Retrieves the drone and shows it in the editor. """
        # Retrieve the identifer of the drone
        item = self.tree.item(self.tree.focus())
        item_id = item['values'][0]

        # Load the drone from the store
        print('Loading drone with ID %04d' % (item_id))
        drone = self.drones.get(item_id)

        # Display the drone
        self.view_drone(drone, self._update_drone)

    def _update_drone(self, drone):
        """ Saves the new details of the drone. """
        self.drones.save(drone)
        #repopulate
        self.populate_data()

    def view_drone(self, drone, save_action):
        """ Displays the drone editor. """
        wnd = DroneEditorWindow(self, drone, save_action)
        self.root.wait_window(wnd.root)


class EditorWindow(object):
    """ Base editor window. """

    def __init__(self, parent, title, save_action):
        # Initialise the new top-level window (modal dialog)
        self._parent = parent.root
        self.root = tk.Toplevel(parent.root)
        self.root.title(title)
        self.root.transient(parent.root)
        self.root.grab_set()

        # Initialise the top level frame
        self.frame = tk.Frame(self.root)
        self.frame.pack(side=tk.TOP, fill=tk.BOTH,
                        expand=tk.Y, padx=10, pady=10)

        # Add the editor widgets
        last_row = self.add_editor_widgets()

        # Add the command buttons
        add_button = tk.Button(self.frame, text="Save",
                               command=save_action, width=20, padx=5, pady=5)
        add_button.grid(in_=self.frame, row=last_row + 1, column=1, sticky=tk.E)
        exit_button = tk.Button(self.frame, text="Close",
                                command=self.close, width=20, padx=5, pady=5)
        exit_button.grid(in_=self.frame, row=last_row + 2, column=1, sticky=tk.E)

    def add_editor_widgets(self):
        """ Adds the editor widgets to the frame - this needs to be overriden in inherited classes. 
        This function should return the row number of the last row added - EditorWindow uses this
        to correctly display the buttons. """
        return -1

    def close(self):
        """ Closes the editor window. """
        self.root.destroy()

class DroneEditorWindow(EditorWindow):
    """ Editor window for drones. """

    def __init__(self, parent, drone, save_action):
        # TODO: Add either the drone name or <new> in the window title, depending on whether this is a new
        # drone or not
        
        self._drone = drone
        self._save_action = save_action
        
        # TODO: Load drone details
        
        self.name = drone.name
        self.clas = drone.class_type
        self.resc = drone.rescue
        super(DroneEditorWindow, self).__init__(parent, 'Drone: ' + self.name, self.save_drone)

    def add_editor_widgets(self):
        """ Adds the widgets dor editing a drone. """
        #TODO: widgets with data
        
        #name label
        namelabel = tk.Label(self.root, text="Name:")
        namelabel.grid(in_=self.frame, row=0, column=0, sticky=tk.W, pady=(0,5))
        if self.name != '<new>':
            name = self.name
        else:
            name = ''
        self.name = tk.Entry(self.root, width=25)
        self.name.insert(0, name)
        self.name.grid(in_=self.frame, row=0, column=1, sticky=tk.W, pady=(0,5))
        #class label
        classlabel = tk.Label(self.root, text="Drone class:")
        classlabel.grid(in_=self.frame, row=3, column=0, sticky=tk.W, pady=(5,5))
        clas = self.clas
        self.clas = ttk.Combobox(self.root, state="readonly", values=['One', 'Two'], width=6)
        self.clas.current(clas - 1)
        self.clas.grid(in_=self.frame, row=3, column=1, sticky=tk.W, pady=(5,5))
        
        #rescue label
        rescuelabel = tk.Label(self.root, text="Rescue Drone:")
        rescuelabel.grid(in_=self.frame, row=4, column=0, sticky=tk.W, pady=(5,5))
        resc = self.resc
        self.resc = ttk.Combobox(self.root, state="readonly", values=['No', 'Yes'], width=6)
        self.resc.current(resc)
        self.resc.grid(in_=self.frame, row=4, column=1, sticky=tk.W, pady=(5,5))
        
        return 5

    def save_drone(self):
        """ Updates the drone details and calls the save action. """
        #TODO Update drone form widgets
        drone = self._drone
        drone.name = "'" + self.name.get() + "'"
        if self.clas.get() == 'Two':
            drone.class_type = 2
        else:
            drone.class_type = 1
        if self.resc.get() == 'Yes':
            drone.rescue = 1
        else:
            drone.rescue = 0
        
        self._drone = drone
        self._save_action(self._drone)
        #close after saving
        self.close()

class OperatorListWindow(ListWindow):
    
    def __init__(self, parent):
        super(OperatorListWindow, self).__init__(parent, 'Operators')

        # Add the list and fill it with data
        columns = ('Name', 'Class', 'rescue', 'Operations', 'Drone')
        self.add_list(columns, self.edit_operator)
        self.populate_data()

        # Add the command buttons
        add_button = tk.Button(self.frame, text="Add Operator",
                               command=self.add_operator, width=20, padx=5, pady=5)
        add_button.grid(in_=self.frame, row=2, column=0, sticky=tk.E)
        exit_button = tk.Button(self.frame, text="Close",
                                command=self.close, width=20, padx=5, pady=5)
        exit_button.grid(in_=self.frame, row=3, column=0, sticky=tk.E)
        
    def populate_data(self):
            """ Populates the data in the view. """
            print('Loading data')
            #clear tree (noticible in refreshing)
            for i in self.tree.get_children():
                self.tree.delete(i)       
            
            li = self.operators.list_all()
            for op in li:
                self.tree.insert('', 'end', values=(op[1] + " " +  op[2], op[4], op[5], op[6], op[7]))

    def add_operator(self):

        # Start a new drone instance
        print('TODO: Start a new operator')
        operator = Operator('<new>', '', '', 1, 0, 0)
        # Display the drone
        self.view_operator(operator, self._save_new_operator)

    def _save_new_operator(self, operator):
        """ Saves the drone in the store and updates the list. """
        self.operators._add(operator)
        self.populate_data()

    def edit_operator(self, event):
        """ Retrieves the drone and shows it in the editor. """
        # Retrieve the identifer of the drone
        item = self.tree.item(self.tree.focus())
        item_id = item['values'][0]

        # Load the drone from the store
        print('Loading operator: %s' % (item_id))
        operator = self.operators.get(item_id)

        # Display the drone
        self.view_operator(operator, self._update_operator)

    def _update_operator(self, operator):
        """ Saves the new details of the drone. """
        self.operators.save(operator)
        #repopulate
        self.populate_data()

    def view_operator(self, operator, save_action):
        """ Displays the drone editor. """
        wnd = OperatorEditorWindow(self, operator, save_action)
        self.root.wait_window(wnd.root)

class OperatorEditorWindow(EditorWindow):
    def __init__(self, parent, operator, save_action):
        # TODO: Add either the drone name or <new> in the window title, depending on whether this is a new
        # drone or not
        
        self._operator = operator
        self._save_action = save_action
        self.name = operator.first_name +" "+ operator.family_name
        self.fn = operator.first_name
        self.ln = operator.family_name
        self.lic = operator.drone_license
        self.re = operator.rescue_endorsement
        self.op = operator.operations
        
        super(OperatorEditorWindow, self).__init__(parent, 'Operator: ' + self.name, self.save_operator)

    def add_editor_widgets(self):
            """ Adds the widgets for editing an operator. """
            #TODO: Create widgets and populate them with data
            #f-name label with entry
            fname = tk.Label(self.root, text="First Name:")
            fname.grid(in_=self.frame, row=0, column=0, sticky=tk.W, pady=(0,5))
            if self.fn != '<new>':
                fn = self.fn
            else:
                fn = ''
            self.fn = tk.Entry(self.root, width=30)
            self.fn.insert(0, fn)
            self.fn.grid(in_=self.frame, row=0, column=1, sticky=tk.E, pady=(0,5))
            
            #l-name label with entry
            lname = tk.Label(self.root, text="Last Name:")
            lname.grid(in_=self.frame, row=1, column=0, sticky=tk.W, pady=(5,5))
            ln = self.ln
            self.ln = tk.Entry(self.root, width=30)
            self.ln.insert(0, ln)
            self.ln.grid(in_=self.frame, row=1, column=1, sticky=tk.E, pady=(5,5))
        
            #license label with drop
            lice = tk.Label(self.root, text="Drone License:")
            lice.grid(in_=self.frame, row=2, column=0, sticky=tk.W, pady=(5,5))
            
            lic = self.lic
            self.lic = ttk.Combobox(self.root, state="readonly", values=['One', 'Two'], width=6)
            self.lic.current(lic - 1)
            self.lic.grid(in_=self.frame, row=2, column=1, sticky=tk.W, pady=(5,5))
            
            
            #rescue with read-only
            resc = tk.Label(self.root, text="Rescue Endorsement:")
            resc.grid(in_=self.frame, row=3, column=0, sticky=tk.W, pady=(5,5))
            re = self.re
            if re == 1:
                re = 'Yes'
            else:
                re = 'No'
            self.re = tk.Entry(self.root, width=9)
            self.re.insert(0, re)
            self.re.configure(state='readonly')
            self.re.grid(in_=self.frame, row=3, column=1, sticky=tk.W, pady=(5,5))
            
            #operations with number limit
            opno = tk.Label(self.root, text="Number of Operations:")
            opno.grid(in_=self.frame, row=4, column=0, sticky=tk.W, pady=(5,5))

            op = StringVar(self.root)
            op.set(self.op)
            self.op = tk.Spinbox(self.root, from_=0, to=20, textvariable=op, width=8)
            self.op.grid(in_=self.frame, row=4, column=1, sticky=tk.W, pady=(5,5))

            return 4
    
    def save_operator(self):
        operator = self._operator
        operator.first_name = "'" +  self.fn.get() + "'"
        operator.family_name = "'" + self.ln.get() + "'"
        if self.lic.get() == 'Two':
            operator.drone_license = 2
        else:
            operator.drone_license = 1
        operator.operations = self.op.get()
        if int(operator.operations) >= 5:
            operator.rescue_endorsement = 1
        else:
            operator.rescue_endorsement = 0
        
        self._operator = operator
        self._save_action(self._operator)
        #close after saving
        self.close()
        
if __name__ == '__main__':
    conn = mysql.connector.connect(host='localhost',
                                   port=3306,
                                   user='root',
                                   database='dronestore',
                                   password='Signum34',
                                   charset='utf8mb4',
                                   autocommit=True)
    app = Application(conn)
    app.main_loop()
    conn.close()
