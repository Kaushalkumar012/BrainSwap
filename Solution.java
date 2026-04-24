class Asset {
    private String assetId;
    private String assetName;
    private String assetExpiry;

    public Asset(String assetId, String assetName, String assetExpiry) {
        setAssetId(assetId);
        this.assetName = assetName;
        this.assetExpiry = assetExpiry;
    }

    public void setAssetId(String assetId) {
        if (assetId != null && assetId.matches("(DSK|LTP|IPH)-\\d{6}[HhLl]"))
            this.assetId = assetId;
        else
            this.assetId = null;
    }

    public String getAssetId() { return assetId; }
    public void setAssetName(String assetName) { this.assetName = assetName; }
    public String getAssetName() { return assetName; }
    public void setAssetExpiry(String assetExpiry) { this.assetExpiry = assetExpiry; }
    public String getAssetExpiry() { return assetExpiry; }

    @Override
    public String toString() {
        return "Asset Id: "+getAssetId()+", Asset Name: "+getAssetName()+", Asset Expiry: "+getAssetExpiry();
    }
}

class Resources {
    public static int getMonth(String month) {
        switch (month) {
            case "Jan": return 1;
            case "Feb": return 2;
            case "Mar": return 3;
            case "Apr": return 4;
            case "May": return 5;
            case "Jun": return 6;
            case "Jul": return 7;
            case "Aug": return 8;
            case "Sep": return 9;
            case "Oct": return 10;
            case "Nov": return 11;
            case "Dec": return 12;
            default: return 0;
        }
    }
}

class InvalidAssetsException extends Exception {
    public InvalidAssetsException(String message) { super(message); }
}

class InvalidExperienceException extends Exception {
    public InvalidExperienceException(String message) { super(message); }
}

abstract class Employee {
    private String employeeId;
    private String employeeName;
    private double salary;

    private static int contractIdCounter;
    private static int permanentIdCounter;

    static {
        contractIdCounter = 10000;
        permanentIdCounter = 10000;
    }

    public Employee(String employeeName) {
        setEmployeeName(employeeName);
    }

    public abstract void calculateSalary(float factor);

    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }
    public String getEmployeeName() { return employeeName; }

    public void setEmployeeName(String name) {
        if (name != null && name.matches("[A-Z][a-z]+( [A-Z][a-z]+)+"))
            this.employeeName = name;
    }

    public double getSalary() { return salary; }
    public void setSalary(double salary) {
        this.salary = salary > 0 ? salary : 0;
    }

    public static int getContractIdCounter() { return contractIdCounter; }
    public static void setContractIdCounter(int val) { contractIdCounter = val; }
    public static int getPermanentIdCounter() { return permanentIdCounter; }
    public static void setPermanentIdCounter(int val) { permanentIdCounter = val; }

    protected static int incrementContractId() { return ++contractIdCounter; }
    protected static int incrementPermanentId() { return ++permanentIdCounter; }

    @Override
    public String toString() {
        return "Employee Id: "+getEmployeeId()+", Employee Name: "+getEmployeeName();
    }
}

class ContractEmployee extends Employee {
    private double wagePerHour;

    public ContractEmployee(String employeeName, double wagePerHour) {
        super(employeeName);
        this.wagePerHour = wagePerHour;
        setEmployeeId("C" + incrementContractId());
    }

    public void calculateSalary(float hoursWorked) {
        double salary = wagePerHour * hoursWorked;
        if (hoursWorked < 190)
            salary -= (wagePerHour / 2) * (190 - hoursWorked);
        setSalary(Math.round(salary));
    }

    public double getWagePerHour() { return wagePerHour; }
    public void setWagePerHour(double wagePerHour) { this.wagePerHour = wagePerHour; }

    @Override
    public String toString() {
        return "Employee Id: "+getEmployeeId()+", Employee Name: "+getEmployeeName()+", Wage Per Hour: "+getWagePerHour();
    }
}

class PermanentEmployee extends Employee {
    private double basicPay;
    private String[] salaryComponents;
    private float experience;
    private Asset[] assets;

    public PermanentEmployee(String employeeName, double basicPay, String[] salaryComponents, Asset[] assets) {
        super(employeeName);
        this.basicPay = basicPay;
        this.salaryComponents = salaryComponents;
        this.assets = assets;
        setEmployeeId("E" + incrementPermanentId());
    }

    public double calculateBonus(float experience) throws InvalidExperienceException {
        if (experience < 2.5f)
            throw new InvalidExperienceException("A minimum of 2.5 years is required for bonus!");
        if (experience < 4) return 2550;
        else if (experience < 8) return 5000;
        else if (experience < 12) return 8750;
        else return 13000;
    }

    public void calculateSalary(float experience) {
        this.experience = experience;
        double da = 0, hra = 0;

        if (salaryComponents != null) {
            for (String comp : salaryComponents) {
                String[] parts = comp.split("-");
                int percent = Integer.parseInt(parts[1]);
                if (parts[0].equals("DA")) da = basicPay * percent / 100.0;
                else if (parts[0].equals("HRA")) hra = basicPay * percent / 100.0;
            }
        }

        double bonus = 0;
        try { bonus = calculateBonus(experience); } catch (InvalidExperienceException e) { bonus = 0; }

        setSalary(Math.round(basicPay + da + hra + bonus));
    }

    private int dateToInt(String date) {
        String[] parts = date.split("-");
        return Integer.parseInt(parts[0]) * 10000
             + Resources.getMonth(parts[1]) * 100
             + Integer.parseInt(parts[2]);
    }

    public Asset[] getAssetsByDate(String lastDate) throws InvalidAssetsException {
        Asset[] result = new Asset[assets.length];
        int count = 0;
        int last = dateToInt(lastDate);

        for (int i = 0; i < assets.length; i++) {
            if (assets[i] != null && dateToInt(assets[i].getAssetExpiry()) <= last)
                result[count++] = assets[i];
        }

        if (count == 0)
            throw new InvalidAssetsException("No assets found for the given criteria!");

        return result;
    }

    public double getBasicPay() { return basicPay; }
    public void setBasicPay(double basicPay) { this.basicPay = basicPay; }
    public String[] getSalaryComponents() { return salaryComponents; }
    public void setSalaryComponents(String[] s) { this.salaryComponents = s; }
    public float getExperience() { return experience; }
    public void setExperience(float experience) { this.experience = experience; }
    public Asset[] getAssets() { return assets; }
    public void setAssets(Asset[] assets) { this.assets = assets; }

    @Override
    public String toString() {
        return "Employee Id: "+getEmployeeId()+", Employee Name: "+getEmployeeName()
             +", Basic Pay: "+getBasicPay()+", Salary Components: "+getSalaryComponents()
             +", Assets: "+getAssets();
    }
}

class Admin {
    public void generateSalarySlip(Employee[] employees, float[] salaryFactor) {
        for (int i = 0; i < employees.length; i++)
            employees[i].calculateSalary(salaryFactor[i]);
    }

    public int generateAssetsReport(Employee[] employees, String lastDate) {
        int count = 0;
        for (Employee e : employees) {
            if (e instanceof PermanentEmployee) {
                try {
                    Asset[] arr = ((PermanentEmployee) e).getAssetsByDate(lastDate);
                    for (Asset a : arr) {
                        if (a != null) count++;
                    }
                } catch (InvalidAssetsException ex) {
                    return -1;
                }
            }
        }
        return count;
    }

    public String[] generateAssetsReport(Employee[] employees, char assetCategory) {
        String[] result = new String[employees.length * 3];
        int index = 0;

        for (Employee e : employees) {
            if (e instanceof PermanentEmployee) {
                Asset[] arr = ((PermanentEmployee) e).getAssets();
                if (arr != null) {
                    for (Asset a : arr) {
                        if (a != null && a.getAssetId() != null &&
                            Character.toUpperCase(a.getAssetId().charAt(0)) == Character.toUpperCase(assetCategory))
                            result[index++] = a.getAssetId();
                    }
                }
            }
        }
        return result;
    }
}
