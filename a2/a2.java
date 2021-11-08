import java.awt.*;
import java.awt.event.*;
import javax.swing.*;
import javax.swing.event.*;
import java.io.File;
import java.util.*;
import javax.swing.border.EmptyBorder;
import java.io.IOException;


public class a2 extends JFrame implements Runnable{
	ArrayList<Packet> packetList;
	File f;
	Object[] srcHost;
	Object[] dstHost;
	boolean sourceIP;
	double[] coords;
	double maxSize = 0;
	double maxTime = 0;
	
	public void run(){
		/*
		Instanciate the frame, iFrame to add all components to
		*/
		JFrame iFrame = new JFrame("Network Panel Transmission Visualizer");
		iFrame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
		iFrame.setSize(1000,500);
		iFrame.setVisible(true);

	
	
		/*
		Create a menu with one option/drop, and two elements, open trace and quit
		*/
		JMenuBar menuBar = new JMenuBar();
		iFrame.setJMenuBar(menuBar);
		JMenu fileMenu = new JMenu("File");
		fileMenu.setMnemonic('F');
		JMenuItem openTrace = new JMenuItem("Open trace file");
		JMenuItem quit = new JMenuItem("Quit");
		
		//panel for body
		JPanel p = new JPanel();
		p.setLayout(new FlowLayout(FlowLayout.LEADING, 0, 0));
		
		/*
		Create radio buttons for source and desitnation host
		when one is selected the other is deselected
		*/
		JPanel radioPanel = new JPanel();
		radioPanel.setLayout(new GridBagLayout());
		GridBagConstraints c = new GridBagConstraints();
		c.gridx = 0;
		c.gridy = GridBagConstraints.RELATIVE;
		c.anchor = GridBagConstraints.WEST;
		JRadioButton sourceHost = new JRadioButton("Source hosts");
		JRadioButton destinHost = new JRadioButton("Destination hosts");
		radioPanel.add(sourceHost, c);
		radioPanel.add(destinHost, c);
		p.add(radioPanel);
		radioPanel.setLocation(0,0);
		radioPanel.setBorder(new EmptyBorder(10, 10, 10, 10));
		
		ButtonGroup radioButtons = new ButtonGroup();
		radioButtons.add(sourceHost);
		radioButtons.add(destinHost);
		sourceHost.setSelected(true); //set default
		
		/*
		Create an invisible combobox for addessses: source and destination
		This is updated everytime a new file is selected
		*/
		JPanel comboxPanel = new JPanel();
		JComboBox<Object> combox = new JComboBox<Object>();
		comboxPanel.add(combox);
		combox.setPreferredSize(new Dimension(200,40));
		comboxPanel.setVisible(false);
		p.add(comboxPanel);		

		
		/*
		Using a grahical class that extends jPanel to draw the graph
		When a file is selected it will plot the points from the coord list created
		*/
		class jPanelG extends JPanel{
			public jPanelG(){
				setPreferredSize(new Dimension(1000, 325));
				setLocation(0,100);
			}
			public void paintComponent(Graphics g){
				super.paintComponent(g);
				Graphics2D g2 = (Graphics2D) g;
				g2.setColor(Color.BLACK);
				
				g2.drawLine(50, 280, 950, 280); //x-axis
				int xlabel = (int)Math.round((maxTime + 2)/12);
				for(int i = 0; i < 14; i++){
					g2.drawLine(50 + (int)(i*75), 280, 50 + (int)(i*75), 285);
					if(f != null){
						g2.drawString(Integer.toString(i*xlabel), 50 + (int)(i*75), 300);
					} else {
						g2.drawString(Integer.toString(i*20), 50 + (int)(i*75), 300);
					}
				}
			
				
				g2.drawLine(50, 30, 50, 280); //y-axis
				
				int yinc = (int) maxSize/9;
				int yx = 20;
				String ylabel = "";
				if(maxSize > 1000) //for labeling purposes
					yx = 10;
				for(int i = 0; i < 11; i++){
					g2.drawLine(45, 30 + (i*25), 50, 30 + (i*25));
					if(f != null){
						if(i*yinc >= 1000000){
							if(i*yinc < 10000000){
								ylabel = Integer.toString(i*yinc/1000000) + "." + Integer.toString((i*yinc % 1000000)/100000) + "M";
							}
							else{
								ylabel = Integer.toString(i*yinc/1000000) + "M";
							}
						}	
						else if(i*yinc >= 1000){
							if(i*yinc < 10000){ //if the maximum value is below 10,000 bytes this will differentiate y plots furhter
								ylabel = Integer.toString(i*yinc/1000) + "." + Integer.toString((i*yinc % 1000)/100) + "k";
							}
							else{
								ylabel = Integer.toString(i*yinc/1000) + "k";
							}
						} 
						else{
							ylabel = Integer.toString(i*yinc);
						}
					g2.drawString(ylabel, yx, 285 - (i*25));
					}
				}

				//if a file is present, draw plots
				if(f != null){
					g2.setColor(Color.GREEN);
					g2.setStroke(new BasicStroke(2));
					for(int i = 0; i < coords.length; i += 2){
						int x = (int) coords[i];
						int y = (int) coords[i+1];
						g2.drawLine(50 + (int)(x * (75.0/xlabel)), 280, 50 + (int)(x * (75.0/xlabel)), 280 - (int)(y * (25.0/yinc)));
					}
				}
			}
		}
		
		/*
		Using the class for the graphics
		adds it to the main panel, p, and sets a backgorund colour
		axis labels are also created here as they are fixed and do not change on a new selection
		*/
		jPanelG graphPanel = new jPanelG();
		graphPanel.setLayout(null);
		p.add(graphPanel);
		JLabel time = new JLabel("Time [s]");
		time.setBounds(480, 300, 50, 20);
		JLabel volume = new JLabel("Volume [bytes]");
		volume.setBounds(10,5,100,20);
		graphPanel.add(time);
		graphPanel.add(volume);
		graphPanel.setLocation(0,100);
		graphPanel.setBackground(Color.WHITE);

		
		/*
		Open trace filemenu action
		When the opent trace file menu is selected this opens a file chooser dialog
		once a file is selected, the combobox is visible, or cleared, then filled by the new source hosts by default
		*/
		openTrace.addActionListener(new ActionListener(){
			public void actionPerformed(ActionEvent e){
				JFileChooser fileChooser = new JFileChooser(".");
				int result = fileChooser.showOpenDialog(a2.this);
				if (result == JFileChooser.APPROVE_OPTION){
					f = fileChooser.getSelectedFile();
					System.out.println("Selected file: " + f.getAbsolutePath());							
					packetList = createValidPacketList(f);
					sourceHost.setSelected(true); //for consistency when swithcing files
					comboxPanel.setVisible(true);
					srcHost = getUniqueSortedSourceHosts(packetList);
					dstHost = getUniqueSortedDestHosts(packetList);
					combox.removeAllItems(); //for consistency when swithcing files
					for(int i = 0; i < srcHost.length; i++){
						combox.addItem(srcHost[i]);
					}
				}
			}
		});
		/*
		Quit option closes the program
		*/
		quit.addActionListener(new ActionListener(){
			public void actionPerformed(ActionEvent e){
				System.exit(0);
			}
		});
		
		fileMenu.add(openTrace);
		fileMenu.add(quit);
		menuBar.add(fileMenu);

		/*
		source host radio listener,
		when it is selected it changes the contents of the combobox, if a file is selected
		*/
		sourceHost.addActionListener(new ActionListener(){
			public void actionPerformed(ActionEvent e){
				if(f != null){
					combox.removeAllItems();
					for(int i = 0; i < srcHost.length; i++){
						combox.addItem(srcHost[i]);
					}
				}
			}
		});

		/*
		similar to the other radio button, but this changes the values to the destination hosts
		*/
		destinHost.addActionListener(new ActionListener(){
			public void actionPerformed(ActionEvent e){
				if(f != null){
					combox.removeAllItems();
					for(int i = 0; i < dstHost.length; i++){
						combox.addItem(dstHost[i]);
					}
				}
			}
		});

		iFrame.getContentPane().add(p);

		/*
		listenstto a selection/changed in the combobox
		on change get the selected addresses relevant data through getGraphData
		repaints the graph to update new plots
		*/
		combox.addItemListener(new ItemListener(){
			public void itemStateChanged(ItemEvent e){
				if(e.getStateChange() == 1){
					if(sourceHost.isSelected()){
						sourceIP = true;
					}
					else{
						sourceIP = false;
					}
						
					coords = getGraphData(packetList, e.getItem().toString(), sourceIP, packetList.get(packetList.size() - 1).getTimeStamp(), 2);
					maxSize = 0; //reset max size on new file
					maxTime = coords[coords.length - 2]; // get max time of coord list
					//go through coords list, find largest byte 'interval'
					for(int i = 1; i < coords.length; i += 2){
						if(coords[i] > maxSize)
							maxSize = coords[i];
					}
				}
				graphPanel.repaint();
			}
		});	
	}
	
	public static void main (String[] args) {
		javax.swing.SwingUtilities.invokeLater(new a2());
	}
	
	//functional classes and methods from coderunner excercise
	/*
	Create a packet for each line in a trace file, adding methods to retrieve values
	*/
	static class Packet{
		private double timestamp;
		private String srcHost;
		private String destHost;
		private int ipPacketSize;
		
		public Packet(String st){
			String[] pack = st.split("\\s+");
			if(pack.length == 7){
			this.timestamp = Double.parseDouble(pack[1]);
			this.srcHost = pack[2];
			this.destHost = pack[3];
			this.ipPacketSize = Integer.parseInt(pack[5]);
			}
			else if(pack.length == 3){
				this.srcHost = "";
				this.destHost = "";
				this.timestamp = Double.parseDouble(pack[1]);
				this.ipPacketSize = 0;
			}
			else{
				this.timestamp = Double.parseDouble(pack[1]);
				this.srcHost = pack[2];
				this.destHost = pack[4];
				this.ipPacketSize = Integer.parseInt(pack[7]);
			}
		}
		
		public double getTimeStamp(){
			return this.timestamp;
		}
		public String getSourceHost(){
			return this.srcHost;
		}
		public String getDestinationHost(){
			return this.destHost;
		}
		public int getIpPacketSize(){
			return this.ipPacketSize;
		}
		public String toString(){
			return String.format("src=%s, dest=%s, time=%.2f, size=%d", this.getSourceHost(), this.getDestinationHost(), this.getTimeStamp(), this.getIpPacketSize());
		}
	}
	
	/*
	Create a host object for an ip in the packet, allowing it to be compared to other host addresses
	*/
	static class Host implements Comparable<Host>{
		
    private String ip;
    
    public Host(String ip){
        this.ip = ip;
    }
    
    public String toString(){
        return String.format("%s", this.ip);
    }
    public int compareTo(Host other){
        String[] adr = ip.split("\\.");
        String[] oth = other.ip.split("\\.");
        if(Integer.parseInt(adr[3]) > Integer.parseInt(oth[3])){
            return 1;
        }else if(Integer.parseInt(adr[3]) == Integer.parseInt(oth[3])){
            return 0;
        }else{
            return -1;
        }
    }
}
	
	/*
	Return an arraylist of pakcets from a selected file
	*/
	public static ArrayList<Packet> createValidPacketList(File f){
    ArrayList<Packet> alp = new ArrayList<Packet>();
    try{
    Scanner input = new Scanner(f);
    while(input.hasNext()){
        Packet p = new Packet(input.nextLine());
        if(p.getSourceHost().equals("") == false){
            alp.add(p);
        }
    }
    input.close();
    return alp;
    }
    catch(IOException e){
        System.out.println(f + " (The system cannot find the file specified)");
        return null;
    }
}
    
	/*
	return a list of sorted hosts from a file, without duplications
	*/
	public static Object[] getUniqueSortedSourceHosts(ArrayList<Packet> packets) {
    Set<String> srcHost = new HashSet<String>();
    for(int i = 0; i < packets.size(); i++){
        srcHost.add(packets.get(i).getSourceHost());
    }
    ArrayList<Host> hostArray = new ArrayList<Host>();
    for(String host: srcHost){
        hostArray.add(new Host(host));
    }
    Collections.sort(hostArray);


    return hostArray.toArray();
}
	
	/*
	return a list of sorted destinations from a file, without duplications
	*/
	public static Object[] getUniqueSortedDestHosts(ArrayList<Packet> packets) {
    Set<String> dstHost = new HashSet<String>();
    for(int i = 0; i < packets.size(); i++){
        dstHost.add(packets.get(i).getDestinationHost());
    }
    ArrayList<Host> hostArray = new ArrayList<Host>();
    for(String host: dstHost){
        hostArray.add(new Host(host));
    }
    Collections.sort(hostArray);


    return hostArray.toArray();
}
	
	/*
	create a list of time and byte 'coordinates' for the plotting/drawing of data
	returns list to combobox (where called)
	*/
	public static double[] getGraphData(ArrayList<Packet> packets, String ipFilter, boolean isSrcHost, double endTime, int interval) {
		int xinc = 0;
		if(endTime%interval > 0){
			xinc = (((int) endTime) / interval) + 1;
		}
		else{
			xinc = ((int) endTime) / interval;
		}
		double[] p = new double[xinc];
		double[] q = new double[xinc];
		int count = 0;
		for(int x = 0; x < xinc; x++){
			p[x] = (x + 1) * interval;
		}
		for(int i=0; i< packets.size(); i++){
			if(isSrcHost){
				if(packets.get(i).getSourceHost().equals(ipFilter)){
					while(packets.get(i).getTimeStamp() > ((count + 1) * interval)){
						count++;
					}
					q[count] += packets.get(i).getIpPacketSize();
				}
			}
			else{
				if(packets.get(i).getDestinationHost().equals(ipFilter)){
					while(packets.get(i).getTimeStamp() > ((count + 1) * interval)){
						count++;
					}
					q[count] += packets.get(i).getIpPacketSize();
				}
			}
		}
		double[] coord = new double[2*xinc];
		count = 0;
		for(int i = 0; i < xinc; i ++){
			coord[count] = p[i];
			coord[count+1] = q[i];
			count += 2;
		}
		/* -- Print the lists of values in graph --
		-- for testing purposes it is left here -- 		
		System.out.println(Arrays.toString(p));
		System.out.println(Arrays.toString(q));
		*/
		return coord;
	}
}