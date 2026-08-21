import { ActionButton } from "./ActionButton";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Car, Plus, Edit2, Trash2, Shield, AlertTriangle, 
  ToggleLeft, ToggleRight, X, Compass, Key, User, Check 
} from 'lucide-react';
import { Vehicle } from '../types';
import { FloatingInput } from './FloatingInput';
import { useLanguage } from '../contexts/LanguageContext';
import { AnimatedSearchBar } from './AnimatedSearchBar';

interface VehiclesViewProps {
  vehicles: Vehicle[];
  onAddVehicle: (vehicle: Vehicle) => void;
  onUpdateVehicle: (vehicle: Vehicle) => void;
  onDeleteVehicle: (vehicleId: string) => void;
  themeColor: 'blue' | 'emerald' | 'red' | 'amber' | 'purple';
  triggerToast: (title: string, message: string, type: 'success' | 'warning' | 'error' | 'info') => void;
  triggerConfirm: (title: string, message: string, onConfirm: () => void) => void;
}

export const VehiclesView: React.FC<VehiclesViewProps> = ({
  vehicles,
  onAddVehicle,
  onUpdateVehicle,
  onDeleteVehicle,
  themeColor,
  triggerToast,
  triggerConfirm,
}) => {
  const { t, formatNumber, formatDate, toDigits } = useLanguage();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  // Form states
  const [formPlateNumber, setFormPlateNumber] = useState('');
  const [formModel, setFormModel] = useState('');
  const [formType, setFormType] = useState<'Truck' | 'Sedan' | 'SUV' | 'Van' | 'Motorcycle'>('Van');
  const [formStatus, setFormStatus] = useState<'Active' | 'Maintenance' | 'Inactive'>('Active');
  const [formDriverName, setFormDriverName] = useState('');
  const [formFuelType, setFormFuelType] = useState<'Octane' | 'Diesel' | 'Electric' | 'CNG'>('CNG');
  const [formLastService, setFormLastService] = useState('');
  const [formMileage, setFormMileage] = useState('');

  const themeText = {
    blue: 'text-blue-600 dark:text-blue-400',
    emerald: 'text-emerald-600 dark:text-emerald-400',
    red: 'text-rose-600 dark:text-rose-400',
    amber: 'text-amber-600 dark:text-amber-400',
    purple: 'text-purple-600 dark:text-purple-400',
  };

  const themeBg = {
    blue: 'bg-blue-600 hover:bg-blue-700',
    emerald: 'bg-emerald-600 hover:bg-emerald-700',
    red: 'bg-rose-600 hover:bg-rose-700',
    amber: 'bg-amber-600 hover:bg-amber-700',
    purple: 'bg-purple-600 hover:bg-purple-700',
  };

  const themeFocusRing = {
    blue: 'focus:ring-blue-500/20 focus:border-blue-500',
    emerald: 'focus:ring-emerald-500/20 focus:border-emerald-500',
    red: 'focus:ring-rose-500/20 focus:border-rose-500',
    amber: 'focus:ring-amber-500/20 focus:border-amber-500',
    purple: 'focus:ring-purple-500/20 focus:border-purple-500',
  };

  const filteredVehicles = vehicles.filter((v) => {
    const sLower = (search || '').toLowerCase();
    const matchesSearch =
      (v?.plateNumber || '').toLowerCase().includes(sLower) ||
      (v?.model || '').toLowerCase().includes(sLower) ||
      ((v?.driverName || '').toLowerCase().includes(sLower));
    const matchesStatus = statusFilter === 'All' || v?.status === statusFilter;
    const matchesType = typeFilter === 'All' || v?.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const openEditModal = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setFormPlateNumber(vehicle.plateNumber);
    setFormModel(vehicle.model);
    setFormType(vehicle.type);
    setFormStatus(vehicle.status);
    setFormDriverName(vehicle.driverName || '');
    setFormFuelType(vehicle.fuelType);
    setFormLastService(vehicle.lastService);
    setFormMileage(vehicle.mileage.toString());
    setIsEditModalOpen(true);
  };

  const openAddModal = () => {
    setFormPlateNumber('');
    setFormModel('');
    setFormType('Van');
    setFormStatus('Active');
    setFormDriverName('');
    setFormFuelType('CNG');
    setFormLastService(new Date().toISOString().split('T')[0]);
    setFormMileage('15000');
    setIsAddModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPlateNumber || !formModel) {
      triggerToast(
        t('Validation Error'),
        t('Plate Number and Model are required.'),
        'error'
      );
      return;
    }
    
    setIsProcessing(true);
    await new Promise(r => setTimeout(r, 600));

    if (selectedVehicle) {
      const updatedVehicle: Vehicle = {
        ...selectedVehicle,
        plateNumber: formPlateNumber,
        model: formModel,
        type: formType,
        status: formStatus,
        driverName: formDriverName || undefined,
        fuelType: formFuelType,
        lastService: formLastService,
        mileage: parseInt(formMileage) || 0,
      };

      setIsProcessing(false);
      setIsEditModalOpen(false);
      onUpdateVehicle(updatedVehicle);
      triggerToast(
        t('✓ Vehicle Updated'),
        t('Vehicle properties updated successfully.'),
        'success'
      );
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPlateNumber || !formModel) {
      triggerToast(
        t('Validation Error'),
        t('Plate Number and Model are required.'),
        'error'
      );
      return;
    }
    
    setIsProcessing(true);
    await new Promise(r => setTimeout(r, 600));

    const newVehicle: Vehicle = {
      id: `VEH-${Math.floor(100 + Math.random() * 900)}`,
      plateNumber: formPlateNumber,
      model: formModel,
      type: formType,
      status: formStatus,
      driverName: formDriverName || undefined,
      fuelType: formFuelType,
      lastService: formLastService,
      mileage: parseInt(formMileage) || 0,
    };

    onAddVehicle(newVehicle);
    setIsProcessing(false);
    setIsAddModalOpen(false);
    triggerToast(
      t('✓ Vehicle Added'),
      t('{model} registered successfully inside fleet registry.', { model: formModel }),
      'success'
    );
  };

  const handleDelete = (vehicle: Vehicle) => {
    triggerConfirm(
      t('Deregister Vehicle?'),
      t('Are you sure you want to delete vehicle {plate}?', { plate: vehicle.plateNumber }),
      () => {
        onDeleteVehicle(vehicle.id);
        triggerToast(
          t('✓ Vehicle Removed'),
          t('The vehicle was successfully deregistered.'),
          'success'
        );
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{t('vehicles.title')}</h2>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
            {t('vehicles.subtitle')}
          </p>
        </div>

        <button
          onClick={openAddModal}
          className={`h-[40px] px-4 rounded-[8px] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm ${themeBg[themeColor]}`}
        >
          <Plus className="w-4 h-4" />
          {t('Register New Vehicle')}
        </button>
      </div>

      {/* Filter and search bar */}
      <div className="p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col md:flex-row gap-4 items-center shadow-xs">
        {/* Search */}
        <AnimatedSearchBar
          value={search}
          onChange={(val) => setSearch(val)}
          placeholder={t('Search plate number, model, driver...')}
          themeColor={themeColor}
        />

        {/* Dropdowns */}
        <div className="flex gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 text-xs px-3 rounded-[8px] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 outline-none"
          >
            <option value="All">{t('All Statuses')}</option>
            <option value="Active">{t('Active')}</option>
            <option value="Maintenance">{t('Maintenance')}</option>
            <option value="Inactive">{t('Inactive')}</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-10 text-xs px-3 rounded-[8px] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 outline-none"
          >
            <option value="All">{t('All Vehicle Types')}</option>
            <option value="Truck">{t('Truck')}</option>
            <option value="Sedan">{t('Sedan')}</option>
            <option value="SUV">{t('SUV')}</option>
            <option value="Van">{t('Van')}</option>
            <option value="Motorcycle">{t('Motorcycle')}</option>
          </select>
        </div>
      </div>

      {/* Grid List */}
      <div className="app-form-grid">
        {filteredVehicles.length > 0 ? (
          filteredVehicles.map((vehicle) => (
            <div key={vehicle.id} className="p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs flex flex-col justify-between hover:border-zinc-200 dark:hover:border-zinc-700 transition-all">
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-400 bg-zinc-50 dark:bg-zinc-800 px-2 py-0.5 rounded">
                      {t(vehicle.type)}
                    </span>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 mt-2">
                      {vehicle.model}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5 font-mono">{toDigits(vehicle.plateNumber)}</p>
                  </div>
                  <span className={`px-2.5 py-1 text-[11px] font-semibold rounded-full ${
                    vehicle.status === 'Active'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                      : vehicle.status === 'Maintenance'
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                  }`}>
                    {t(vehicle.status)}
                  </span>
                </div>

                <div className="mt-4 space-y-2 border-t border-b border-zinc-50 dark:border-zinc-800/80 py-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-400 font-medium">{t('Driver Assignment')}</span>
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                      {vehicle.driverName ? t(vehicle.driverName) : t('No Driver Assigned')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400 font-medium">{t('Fuel Source')}</span>
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                      {t(vehicle.fuelType)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400 font-medium">{t('Total Mileage')}</span>
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300 font-mono">
                      {formatNumber(vehicle.mileage)} {t('KM')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400 font-medium">{t('Last Service')}</span>
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">{formatDate(vehicle.lastService)}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4 pt-1">
                <button
                  onClick={() => openEditModal(vehicle)}
                  className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  {t('Edit')}
                </button>
                <button
                  onClick={() => handleDelete(vehicle)}
                  className="p-2 rounded-lg border border-rose-100 dark:border-rose-950/40 hover:bg-rose-50/20 text-rose-500 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {t('Delete')}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-xs text-zinc-400">
            {t('No vehicles matching your search filters.')}
          </div>
        )}
      </div>

      {/* Add / Edit Form Modal */}
      <AnimatePresence>
        {(isEditModalOpen || isAddModalOpen) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsEditModalOpen(false);
                setIsAddModalOpen(false);
              }}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full app-fluid-modal bg-white dark:bg-zinc-900 rounded-2xl shadow-xl overflow-hidden border border-zinc-200/20 max-h-[90vh] flex flex-col"
            >
              <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between shrink-0">
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                  {isEditModalOpen 
                    ? t('Modify Vehicle Details') 
                    : t('Register Transport Asset')}
                </h3>
                <button
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setIsAddModalOpen(false);
                  }}
                  className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={isEditModalOpen ? handleUpdate : handleAdd} className="overflow-y-auto flex-1 p-6 space-y-6">
                
                {/* Global Responsive Form Input Grid (1 Column Mobile, 2 Columns Tablet, 3 Columns Desktop) */}
                <div className="app-form-grid">
                  <FloatingInput
                    label={t('License Plate Number *')}
                    value={formPlateNumber}
                    onChange={(e) => setFormPlateNumber(e.target.value)}
                    themeColor={themeColor}
                    placeholder={t('DHAKA METRO-GA-12-3456')}
                    required
                  />

                  <FloatingInput
                    label={t('Model Spec *')}
                    value={formModel}
                    onChange={(e) => setFormModel(e.target.value)}
                    themeColor={themeColor}
                    placeholder={t('Toyota Hiace 2022')}
                    required
                  />

                  <FloatingInput
                    label={t('Assigned Driver Name')}
                    value={formDriverName}
                    onChange={(e) => setFormDriverName(e.target.value)}
                    themeColor={themeColor}
                    placeholder={t('Enter driver name')}
                  />

                  <FloatingInput
                    label={t('Total Mileage (KM)')}
                    value={formMileage}
                    onChange={(e) => setFormMileage(e.target.value)}
                    type="number"
                    themeColor={themeColor}
                    required
                  />

                  <FloatingInput
                    label={t('Last Service Date')}
                    value={formLastService}
                    onChange={(e) => setFormLastService(e.target.value)}
                    type="date"
                    themeColor={themeColor}
                    required
                  />

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">{t('Type')}</label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value as any)}
                      className={`h-11 px-3 text-xs rounded-[8px] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 outline-none transition-all ${themeFocusRing[themeColor]} focus:ring-1`}
                    >
                      <option value="Van">{t('Van')}</option>
                      <option value="Truck">{t('Truck')}</option>
                      <option value="SUV">{t('SUV')}</option>
                      <option value="Sedan">{t('Sedan')}</option>
                      <option value="Motorcycle">{t('Motorcycle')}</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">{t('Status')}</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as any)}
                      className={`h-11 px-3 text-xs rounded-[8px] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 outline-none transition-all ${themeFocusRing[themeColor]} focus:ring-1`}
                    >
                      <option value="Active">{t('Active')}</option>
                      <option value="Maintenance">{t('Maintenance')}</option>
                      <option value="Inactive">{t('Inactive')}</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">{t('Fuel Type')}</label>
                    <select
                      value={formFuelType}
                      onChange={(e) => setFormFuelType(e.target.value as any)}
                      className={`h-11 px-3 text-xs rounded-[8px] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 outline-none transition-all ${themeFocusRing[themeColor]} focus:ring-1`}
                    >
                      <option value="CNG">{t('CNG')}</option>
                      <option value="Diesel">{t('Diesel')}</option>
                      <option value="Octane">{t('Octane')}</option>
                      <option value="Electric">{t('Electric')}</option>
                    </select>
                  </div>
                </div>

                <div className="pt-5 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setIsAddModalOpen(false);
                    }}
                    className="h-10 px-4 rounded-[8px] bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-200 transition-all"
                  >
                    {t('Cancel')}
                  </button>
                  <ActionButton
                    type="submit"
                    isLoading={isProcessing}
                    actionType={isEditModalOpen ? 'update' : 'create'}
                    className={`h-10 px-4 rounded-[8px] text-white text-xs font-semibold transition-all ${themeBg[themeColor]}`}
                  >
                    {isEditModalOpen 
                      ? t('Save Changes') 
                      : t('Register Vehicle')}
                  </ActionButton>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
