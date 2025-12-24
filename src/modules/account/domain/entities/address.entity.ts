import { BadRequestException } from '@nestjs/common';
import { DomainEntityBase } from 'src/shared/ddd/domain/base/domain-entity.base';
import { v7 as uuidV7 } from 'uuid';

interface AddressProps {
  id: string;
  fullName: string;
  phoneNumber: string;
  street: string;
  unit?: string;
  ward?: string;
  city: string;
  region: string;
  postalCode: string;
  countryCode: string;
  isDefault: boolean;
  label: string;
}

interface CreateAddressProps {
  id?: string;
  fullName: string;
  phoneNumber: string;
  street: string;
  unit?: string;
  ward?: string;
  city: string;
  region: string;
  postalCode: string;
  countryCode: string;
  isDefault?: boolean;
  label: string;
}

export class Address extends DomainEntityBase<string, AddressProps> {
  private constructor(props: AddressProps) {
    super(props);
    this.validate(props);
  }

  static create(props: CreateAddressProps): Address {
    return new Address({
      ...props,
      id: props.id ?? uuidV7(),
      isDefault: props.isDefault ?? false,
    });
  }

  private validate(props: AddressProps): void {
    if (!props.fullName?.trim()) {
      throw new BadRequestException('Full name is required');
    }
    if (!props.phoneNumber?.trim()) {
      throw new BadRequestException('Phone number is required');
    }
    if (!props.street?.trim()) {
      throw new BadRequestException('Street is required');
    }
    if (!props.city?.trim()) {
      throw new BadRequestException('City is required');
    }
    if (!props.region?.trim()) {
      throw new BadRequestException('Region is required');
    }
    if (!props.postalCode?.trim()) {
      throw new BadRequestException('Postal code is required');
    }
    if (!props.countryCode?.trim()) {
      throw new BadRequestException('Country code is required');
    }
  }

  getFullName(): string {
    return this.props.fullName;
  }

  getPhoneNumber(): string {
    return this.props.phoneNumber;
  }

  getStreet(): string {
    return this.props.street;
  }

  getUnit(): string | undefined {
    return this.props.unit;
  }

  getWard(): string | undefined {
    return this.props.ward;
  }

  getCity(): string {
    return this.props.city;
  }

  getRegion(): string {
    return this.props.region;
  }

  getPostalCode(): string {
    return this.props.postalCode;
  }

  getCountryCode(): string {
    return this.props.countryCode;
  }

  getLabel(): string {
    return this.props.label;
  }

  isDefault(): boolean {
    return this.props.isDefault;
  }

  setFullName(fullName: string): void {
    this.props.fullName = fullName;
  }

  setPhoneNumber(phoneNumber: string): void {
    this.props.phoneNumber = phoneNumber;
  }

  setStreet(street: string): void {
    this.props.street = street;
  }

  setUnit(unit?: string): void {
    this.props.unit = unit;
  }

  setWard(ward?: string): void {
    this.props.ward = ward;
  }

  setCity(city: string): void {
    this.props.city = city;
  }

  setRegion(region: string): void {
    this.props.region = region;
  }

  setPostalCode(postalCode: string): void {
    this.props.postalCode = postalCode;
  }

  setCountryCode(countryCode: string): void {
    this.props.countryCode = countryCode;
  }

  setLabel(label: string): void {
    this.props.label = label;
  }

  setAsDefault(): void {
    this.props.isDefault = true;
  }

  unsetDefault(): void {
    this.props.isDefault = false;
  }
}

