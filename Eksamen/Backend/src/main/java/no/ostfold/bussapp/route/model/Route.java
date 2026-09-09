package no.ostfold.bussapp.route.model;

public class Route {
    private String from;
    private String to;
    private int durationMinutes;
    private String departureTime;
    private String arrivalTime;
    private String routeCode;
    private String routeName;

    public Route(String from, String to, int durationMinutes, String departureTime, String arrivalTime, String routeCode, String routeName) {
        this.from = from;
        this.to = to;
        this.durationMinutes = durationMinutes;
        this.departureTime = departureTime;
        this.arrivalTime = arrivalTime;
        this.routeCode = routeCode;
        this.routeName = routeName;
    }

    public String getFrom() { return from; }
    public String getTo() { return to; }
    public int getDurationMinutes() { return durationMinutes; }
    public String getDepartureTime() { return departureTime; }
    public String getArrivalTime() { return arrivalTime; }
    public String getRouteCode() { return routeCode; }
    public String getRouteName() { return routeName; }
}

