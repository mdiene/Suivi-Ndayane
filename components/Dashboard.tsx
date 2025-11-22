import React, { useMemo } from 'react';
import { Delivery } from '../types';
import { RECENT_ACTIVITY_DAYS, ACTIVE_TRUCK_DAYS } from '../constants';
import { Truck, Package, Scale, Activity } from 'lucide-react';

interface DashboardProps {
  deliveries: Delivery[];
}

const Dashboard: React.FC<DashboardProps> = ({ deliveries }) => {
  const metrics = useMemo(() => {
    const now = new Date();
    
    // Total Deliveries (using all data for "running total")
    const totalDeliveries = deliveries.length;

    // Total Weight
    const totalWeight = deliveries.reduce((sum, d) => sum + Number(d.weight_loaded), 0);

    // Active Trucks (Last 30 days)
    const activeThresholdDate = new Date();
    activeThresholdDate.setDate(now.getDate() - ACTIVE_TRUCK_DAYS);
    
    const activeTrucksSet = new Set(
      deliveries
        .filter(d => new Date(d.loading_date) >= activeThresholdDate)
        .map(d => d.truck_immatriculation)
    );
    const activeTrucks = activeTrucksSet.size;

    // Recent Activity (Last 7 days)
    const recentThresholdDate = new Date();
    recentThresholdDate.setDate(now.getDate() - RECENT_ACTIVITY_DAYS);
    const recentActivity = deliveries.filter(d => new Date(d.created_at || d.loading_date) >= recentThresholdDate).length;

    return { totalDeliveries, totalWeight, activeTrucks, recentActivity };
  }, [deliveries]);

  const StatCard = ({ title, value, subtext, icon: Icon, colorClass }: any) => (
    <div className="stats shadow bg-base-100 w-full border border-base-200">
      <div className="stat">
        <div className={`stat-figure ${colorClass} bg-opacity-10 p-2 rounded-full`}>
          <Icon className={`w-6 h-6 ${colorClass}`} />
        </div>
        <div className="stat-title text-xs font-bold uppercase tracking-wider opacity-70">{title}</div>
        <div className="stat-value text-2xl">
          {value}
          {subtext && <span className="text-sm font-normal opacity-60 ml-1">{subtext}</span>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard 
        title="Total Deliveries" 
        value={metrics.totalDeliveries} 
        icon={Package} 
        colorClass="text-primary"
      />
      <StatCard 
        title="Weight Transported" 
        value={metrics.totalWeight.toLocaleString('en-US', { maximumFractionDigits: 0 })} 
        subtext="kg"
        icon={Scale} 
        colorClass="text-secondary"
      />
      <StatCard 
        title="Active Trucks (30d)" 
        value={metrics.activeTrucks} 
        icon={Truck} 
        colorClass="text-warning"
      />
      <StatCard 
        title="Recent Activity (7d)" 
        value={metrics.recentActivity} 
        icon={Activity} 
        colorClass="text-accent"
      />
    </div>
  );
};

export default Dashboard;